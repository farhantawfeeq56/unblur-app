"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface OutputData {
  productSummary: string
  userFlow: { step: string; description: string }[]
  buildPrompt: string
}

interface OutputNodeProps {
  output: OutputData | null
}

export function OutputNode({ output }: OutputNodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!output) return
    const text = [
      "PRODUCT SUMMARY",
      output.productSummary,
      "",
      "USER FLOW",
      ...output.userFlow.map((s) => `${s.step}: ${s.description}`),
      "",
      "BUILD PROMPT",
      output.buildPrompt,
    ].join("\n")
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm",
        "min-w-[260px] max-w-[320px] w-full",
        output ? "border-foreground/20" : "border-dashed",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground select-none">
          Output
        </span>
        {output && (
          <button
            onClick={handleCopy}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {!output ? (
        <p className="text-sm text-muted-foreground/50 leading-relaxed">
          Fill in the nodes and click Generate to see your product summary here.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Product Summary */}
          <section className="flex flex-col gap-1">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Product Summary
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{output.productSummary}</p>
          </section>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* User Flow */}
          <section className="flex flex-col gap-2">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              User Flow
            </h3>
            <ol className="flex flex-col gap-1.5">
              {output.userFlow.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-foreground leading-relaxed">
                    <span className="font-medium">{s.step}:</span> {s.description}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Build Prompt */}
          <section className="flex flex-col gap-1">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Build Prompt
            </h3>
            <pre className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap font-mono bg-secondary/50 rounded-lg p-3">
              {output.buildPrompt}
            </pre>
          </section>
        </div>
      )}
    </div>
  )
}
