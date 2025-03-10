import axios from "axios";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

let conversationHistory: Message[] = [];

export async function callSupportAgent(message: string) {
  try {
    conversationHistory.push({ role: "user", content: message });

    const response = await axios.post("/api/support", {
      messages: conversationHistory,
    });

    console.log("API res", response.data);
    if (response.data.response) {
      conversationHistory.push({
        role: "assistant",
        content: response.data,
      });
    }

    return response.data;
  } catch (error) {
    console.error("Error calling support endpoint:", error);
    console.log({ error });
    throw new Error("Failed to call support endpoint");
  }
}

export function resetConversation() {
  conversationHistory = [];
}
