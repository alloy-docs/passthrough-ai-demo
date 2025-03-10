"use client";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Mic, Send } from "lucide-react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown"; // Import react-markdown
import remarkGfm from "remark-gfm";
import TALKDESK_LOGO from "../lib/TALKDESK_LOGO.svg";
import ALLOY_LOGO from "../lib/ALLOY_LOGO.svg";
import Image from "next/image";
import { useState, useCallback } from "react";

export default function Home() {
  const [key, setKey] = useState(0);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
  } = useChat({
    api: "/api/support",
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content: "Hello, Sara, what can I help you with today?",
      },
    ],
    onResponse: (response) => {
      console.log("AI Response received:", response);
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: "welcome-message",
        role: "assistant",
        content: "Hello, Sara, what can I help you with today?",
      },
    ]);
    setInput("");
    setKey((prevKey) => prevKey + 1);
  }, [setMessages, setInput]);

  const handleCardClick = (query: string) => {
    setInput(query);
  };

  // ... rest of the component remains the same

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16">
          <div className="mb-6 flex justify-center items-center text-green-500">
            <div>
              <Image src={TALKDESK_LOGO || "/placeholder.svg"} alt="logo" />
            </div>

            <span className="mx-3 text-2xl font-bold">+</span>
            <div className="flex h-10 w-10 items-center justify-center ">
              <Image src={ALLOY_LOGO || "/placeholder.svg"} alt="alloy logo" />
            </div>
          </div>

          <div className="mb-8 text-center text-gray-300">
            <p className="mb-2 text-sm">
              This Support Agent chatbot showcases the power of Alloy
              {"Automation's"} Passthrough APIs to build AI agents quickly.{" "}
            </p>

            <p className="text-sm">
              Learn more about{" "}
              <Link
                href="https://runalloy.com"
                className="underline text-green-400 hover:text-green-300"
              >
                Alloy{"'"}s
              </Link>{" "}
              Passthrough APIs by visiting the{" "}
              <Link
                href="https://docs.runalloy.com/embedded/passthrough-api"
                className="underline text-green-400 hover:text-green-300"
              >
                docs
              </Link>
              .
            </p>
          </div>

          <div className="mb-8 grid w-full grid-cols-2 gap-4">
            <Card className="cursor-pointer p-4 bg-gray-800 hover:bg-gray-700 transition">
              <p
                className="text-sm font-medium text-gray-200"
                onClick={() =>
                  handleCardClick("What was my most recent order?")
                }
              >
                What was my most recent order?
              </p>
            </Card>
            <Card
              className="cursor-pointer p-4 bg-gray-800 hover:bg-gray-700 transition"
              onClick={() =>
                handleCardClick("What products do you have in stock?")
              }
            >
              <p className="text-sm font-medium text-gray-200">
                What products do you have in stock?
              </p>
            </Card>
          </div>

          <div
            key={key}
            className="messages space-y-4 p-4 max-w-3xl w-full max-h-[40vh] overflow-y-auto bg-gray-900 rounded-xl shadow-lg"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`text-sm max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-md ${
                    msg.role === "user"
                      ? "bg-gray-700 text-white rounded-br-none"
                      : "bg-green-800 text-white rounded-bl-none"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 text-white">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 mb-2 text-white">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 mb-2 text-white">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1 text-white">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-white">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-white">{children}</em>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-700 rounded px-1 py-0.5 text-sm text-white">
                            {children}
                          </code>
                        ),
                        a: ({ children, href }) => (
                          <Link
                            href={href || "#"}
                            className="underline text-green-400 hover:text-green-300"
                          >
                            {children}
                          </Link>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
          </div>

          <form className="relative w-full mt-8" onSubmit={handleSubmit}>
            <Input
              className="pr-12 pl-10 py-6 text-base rounded-xl border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
              placeholder="Send a message..."
              value={input}
              onChange={handleInputChange}
              required
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400"
            >
              <Mic className="h-5 w-5" />
              <span className="sr-only">Use microphone</span>
            </Button>
            <Button
              size="icon"
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-green-600 text-white hover:bg-green-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <Button
            onClick={handleReset}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
          >
            Reset Conversation
          </Button>
        </div>
      </main>
    </div>
  );
}
