// import cron from "node-cron";
import axios from "axios";

const BASE_URL = "https://production.runalloy.com/2024-03/passthrough";
const ALLOY_API_KEY = process.env.NEXT_PUBLIC_ALLOY_API_KEY;
const SHOPIFY_CREDENTIAL_ID = process.env.NEXT_PUBLIC_SHOPIFY_CREDENTIAL_ID;

// Fetch functions using Alloy Passthrough API
async function fetchProductsFromShopify() {
  const config = {
    method: "POST",
    url: `${BASE_URL}?credentialId=${SHOPIFY_CREDENTIAL_ID}`,
    headers: {
      Authorization: `Bearer ${ALLOY_API_KEY}`,
    },
    data: {
      method: "GET",
      path: "/admin/api/2025-01/products.json",
      body: null,
      query: {},
      extraHeaders: {},
    },
  };
  try {
    const response = await axios.request(config);
    if (response.data.errors) {
      console.error("Shopify API error:", response.data.errors);
      return null;
    }
    // Simplify the product data to reduce tokens
    const simplifiedProducts = (response.data.products || []).map(
      (product: any) => ({
        title: product.title,
        variants: product.variants.slice(0, 1).map((variant: any) => ({
          price: variant.price,
          inventory_quantity: variant.inventory_quantity,
        })),
      })
    );
    console.log("Shopify response (simplified products):", simplifiedProducts);
    return simplifiedProducts; // Return simplified array of up to 20 products
  } catch (error) {
    console.error(
      "Shopify Passthrough API error:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function fetchOrdersFromShopify(customerId: string) {
  if (!customerId) {
    console.error("Customer ID is required to fetch orders");
    return null;
  }

  const config = {
    method: "POST",
    url: `${BASE_URL}?credentialId=${SHOPIFY_CREDENTIAL_ID}`,
    headers: {
      Authorization: `Bearer ${ALLOY_API_KEY}`,
    },
    data: {
      method: "GET",
      path: "/admin/api/2025-01/orders.json",
      body: null,
      query: { limit: 20, status: "any", customer_id: customerId }, // Filter by customerId
      extraHeaders: {},
    },
  };
  try {
    const response = await axios.request(config);
    if (response.data.errors) {
      console.error("Shopify API error for orders:", response.data.errors);
      return null;
    }
    // Simplify order data to reduce tokens, matching the API response structure
    const simplifiedOrders = (response.data.orders || []).map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      total_price: order.total_price,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status || "Not Fulfilled", // Default if null
      created_at: order.created_at,
      line_items: order.line_items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      customer_id: order.customer ? order.customer.id : null,
    }));
    console.log("Shopify response (simplified orders):", simplifiedOrders);
    return simplifiedOrders;
  } catch (error) {
    console.error(
      "Shopify Passthrough API error for orders:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function callSupportAgent(message: string) {
  try {
    console.log({ message });
    const response = await axios.post("/api/support", {
      messages: [{ role: "user", content: message }],
    });
    console.log(response.data);
    return response.data; //
  } catch (error) {
    // Handle error appropriately
    console.error("Error calling support endpoint:", error);
    throw new Error("Failed to call support endpoint");
  }
}

// Scheduled task for daily reconciliation at 5:00 PM PST
// cron.schedule("0 17 * * *", async () => {
//   console.log("Running scheduled reconciliation at close of business");
//   const res = await fetch("http://localhost:3000/api/sync", { method: "GET" });
//   console.log(await res.json());
// });

export { fetchProductsFromShopify, fetchOrdersFromShopify, callSupportAgent };
