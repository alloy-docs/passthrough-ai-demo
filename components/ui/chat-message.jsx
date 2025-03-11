"use client";

import { Message } from "ai";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { MemoizedReactMarkdown } from "../markdown";
import { CodeBlock } from "./codeblock";

export function ChatMessage({ message }) {
  return (
    <div className="flex-1 space-y-2 overflow-hidden">
      <MemoizedReactMarkdown
        className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          code({ inline, className, children, ...props }) {
            if (children && !Array.isArray(children) && "type" in children) {
              return children;
            }

            const match = /language-(\w+)/.exec(className || "");

            if (inline) {
              return (
                <code
                  className="px-1 py-0.5 rounded-sm bg-muted font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(children).replace(/\n$/, "")}
                {...props}
              />
            );
          },
        }}
      >
        {message.content}
      </MemoizedReactMarkdown>
    </div>
  );
}
