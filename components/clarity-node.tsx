"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

export type ClarityState = "empty" | "weak" | "medium" | "strong"

export interface ClarityResult {
  score: number
  state: ClarityState
  feedback: string
}

interface ClarityNodeProps {
  title: string
  value: string
  onChange: (value: string) => void
  evaluator: (value: string) => ClarityResult
  suggestions?: string[]
  placeholder?: string
}

const stateStyles: Record<ClarityState, string> = {
  empty: "border-border text-muted-foreground",
  weak: "border-red-400 text-red-600",
  medium: "border-amber-400 text-amber-600",
  strong: "border-emerald-400 text-emerald-600",
}

export function ClarityNode({
  title,
  value,
  onChange,
  evaluator,
  suggestions = [],
  placeholder = "Write your answer...",
}: ClarityNodeProps) {
  const result = useMemo(() => evaluator(value), [evaluator, value])

  return (
    <div className={cn("w-full rounded-xl border bg-card p-4 shadow-sm", stateStyles[result.state])}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide uppercase">{title}</h2>
        <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", stateStyles[result.state])}>
          {result.score}%
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-24 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <p className="mt-2 text-xs">{result.feedback}</p>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange(suggestion)}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:bg-secondary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
