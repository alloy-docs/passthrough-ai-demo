"use client";

import { useChat } from "ai/react";
import { Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ChatMessage } from "./ui/chat-message";
import { Card, CardFooter, CardHeader } from "./ui/card";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input on page load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;
    handleSubmit(e);
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Start a conversation with the AI assistant.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user" ? "bg-muted" : "bg-primary/10"
                }
              >
                <div className="flex items-start gap-4 rounded-lg p-4">
                  <div
                    className={
                      message.role === "user"
                        ? "bg-background"
                        : "bg-primary/20"
                    }
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <ChatMessage message={message} />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardHeader>
      <CardFooter>
        <form ref={formRef} onSubmit={onSubmit} className="w-full">
          <div className="relative">
            <Textarea
              ref={inputRef}
              tabIndex={0}
              placeholder="Send a message..."
              className="min-h-12 resize-none pr-12"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || input.trim() === ""}
              className="absolute right-2 top-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive mt-2">
              Error: {error.message}
            </p>
          )}
        </form>
      </CardFooter>
    </Card>
  );
}
