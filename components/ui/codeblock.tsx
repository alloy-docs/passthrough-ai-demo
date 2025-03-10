"use client"

import { type FC, useState } from "react"
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

interface Props {
  language: string
  value: string
}

export const CodeBlock: FC<Props> = ({ language, value }) => {
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const onCopy = () => {
    if (isCopied) return
    navigator.clipboard.writeText(value)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="relative w-full font-sans codeblock bg-zinc-950 rounded-md">
      <div className="flex items-center justify-between w-full px-4 py-2 text-xs text-zinc-100 bg-zinc-800 rounded-t-md">
        <span>{language}</span>
        <div className="flex items-center space-x-1">
          <button onClick={onCopy} className="p-1 rounded hover:bg-zinc-700">
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={coldarkDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1.5rem",
          borderRadius: "0 0 0.5rem 0.5rem",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}
