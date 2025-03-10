import { streamText } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { fetchProductsFromShopify, fetchOrdersFromShopify } from "./apiClient";
import { openai } from "@ai-sdk/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const CUSTOMER_ID = "6806197010592";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = body.messages || [];

  console.log({ messages });

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Messages are required" },
      { status: 400 }
    );
  }

  const currentMessage = messages[messages.length - 1].content;

  let shopifyProducts = null;
  let shopifyOrders = null;

  const productMatch =
    currentMessage.match(
      /(?:product|Product)\s*([A-Za-z0-9\s-]+)|(?:is\s+)?([A-Za-z0-9\s-]+)\s*(?:available|in\s+stock)/i
    )?.[1] || currentMessage.match(/[A-Za-z0-9\s-]+/i)?.[0];
  console.log({ productMatch });
  if (
    productMatch ||
    currentMessage.includes("availability") ||
    currentMessage.includes("price") ||
    currentMessage.includes("purchase")
  ) {
    try {
      shopifyProducts = await fetchProductsFromShopify();
      console.log({ shopifyProducts: shopifyProducts[0] });
    } catch (error) {
      console.error("Error fetching Shopify products:", error);
      shopifyProducts = null;
    }
  }
  if (
    currentMessage.includes("order") || // Trigger for order-related queries
    currentMessage.includes("status") // Trigger for status-related queries
  ) {
    try {
      shopifyOrders = await fetchOrdersFromShopify(CUSTOMER_ID);
      console.log({ shopifyOrders: shopifyOrders[0] });
    } catch (error) {
      console.error("Error fetching Shopify orders:", error);
      shopifyOrders = null;
    }
  }

  const systemMessage = {
    role: "system",
    content: `
      You are a highly accurate and helpful support agent for my Shopify store. Your purpose is to assist customers with queries about products or their orders, using only the data provided in the "Product Info" and "Order Info" below. Always check the relevant data before responding, switching context based on the query:
      - Use "Product Info" for product-related queries (e.g., availability, price, purchase).
      - Use "Order Info" for order-related queries (e.g., status, order).
      Respond conversationally in Markdown format with **bold** for emphasis, *italics* for notes, and bullet points for lists. Follow these strict rules:
  
      1. **Always Use Relevant Store Data**:
         - If "Product Info" exists and the query includes "product," "availability," "price," or "purchase," it’s an array of products, each with:
           - \`title\`: The product name.
           - \`variants\`: An array where \`variants[0]\` contains:
             - \`price\`: The product price as a string.
             - \`inventory_quantity\`: The number of units in stock.
           - Search for a matching \`title\` (fuzzy or partial match). If no match or "Product Info" is null, respond with: "Sorry, I couldn’t find that product in our store. Please check the product name or try another query."
         - If "Order Info" exists and the query includes "order" or "status," it’s an array of up to 5 recent orders for the logged-in user (based on Customer ID), each with:
           - \`id\`: The order ID.
           - \`order_number\`: The order number.
           - \`total_price\`: The total price as a string.
           - \`financial_status\`: The payment status (e.g., "paid," "pending").
           - \`fulfillment_status\`: The fulfillment status (e.g., "fulfilled," "pending," "Not Fulfilled").
           - \`created_at\`: The order creation date.
           - \`line_items\`: An array of items with \`title\`, \`quantity\`, and \`price\`.
           - Search for matching orders. If no match or "Order Info" is null, respond with: "Sorry, I couldn’t find any order details for you. Please try again later or provide your customer ID."
  
      2. **Product-Related Queries**:
         - **Availability**: If the query includes "availability" or "in stock," use \`variants[0].inventory_quantity\`. If 0 or missing, say: "**[title]** is currently out of stock." If > 0, say: "**[title]** is in stock with [variants[0].inventory_quantity] units available."
         - **Pricing**: If the query includes "price," use \`variants[0].price\`. Respond with: "**[title]** is priced at $[variants[0].price]."
         - **Simulated Purchases**: If the query includes "purchase" or "buy," simulate the order with: "**Order Simulated**: You’ve successfully added **[title]** ($[variants[0].price]) to your cart. Please visit our store to complete the purchase (this is a simulation and doesn’t process payment)."
  
      3. **Order-Related Queries**:
         - **Order Status**: For queries like "order status" or "where’s my order?", list recent orders with: "**Order #[order_number]** - Financial Status: [financial_status], Fulfillment Status: [fulfillment_status], Created: [created_at]. Items: [line_items details (e.g., title (quantity units, $price))]."
           - Use bullet points for multiple orders (e.g., "- **Order #7965**...").
         - **General Questions**: For queries like "shipping status" or "when was my order placed?", provide details (e.g., fulfillment status or created_at) or say: "*I can provide details for your recent orders. Please specify an order number or ask about a specific status.*"
  
      4. **No Assumptions**: Do not guess or invent details—use only "Product Info" for products or "Order Info" for orders. For orders, ensure the information corresponds to the provided Customer ID (the logged-in user).
  
      5. **Markdown Formatting**: Always use Markdown. Use **bold** for titles, prices, order numbers, statuses, *italics* for notes, and bullet points for lists.
  
      6. **Conversational Tone**: Be friendly and concise, e.g., "Hi! Let me check that for you..." for products, or "Hi! I’d be happy to help with that. Let me check your orders..." for orders.
  
      Product Info: ${
        shopifyProducts ? JSON.stringify(shopifyProducts) : "null"
      }
      Order Info: ${shopifyOrders ? JSON.stringify(shopifyOrders) : "null"}
      Product Match from User: ${productMatch || "none"}
      Customer ID: ${CUSTOMER_ID || "none"}
  
      Respond briefly and concisely in Markdown, focusing on the relevant data (products or orders) based on the query. For order-related queries, only provide information related to the Customer ID.
      `,
  };

  const trimmedMessages = messages.slice(-5);
  const fullMessages = [systemMessage, ...trimmedMessages];
  const result = streamText({
    model: openai("gpt-4o", OPENAI_API_KEY),
    messages: fullMessages,
  });

  return result.toDataStreamResponse({
    onCompletion: async (completion) => {
      // No storage logic needed
      console.log("Conversation completed:", completion);
    },
    getErrorMessage: (error) => {
      if (error == null) {
        return "unknown error";
      }

      if (typeof error === "string") {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}
