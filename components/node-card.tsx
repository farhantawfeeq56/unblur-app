"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type ClarityLevel = "weak" | "okay" | "clear" | "empty"

const VAGUE_WORDS = [
  "something",
  "stuff",
  "things",
  "people",
  "users",
  "everyone",
  "anyone",
  "someone",
  "maybe",
  "kind of",
  "sort of",
  "etc",
  "and so on",
  "various",
  "many",
]

function scoreClarity(text: string): ClarityLevel {
  if (!text || text.trim().length === 0) return "empty"
  const lower = text.toLowerCase()
  const wordCount = text.trim().split(/\s+/).length

  const vagueCount = VAGUE_WORDS.filter((w) => lower.includes(w)).length

  if (vagueCount >= 2 || wordCount < 3) return "weak"
  if (vagueCount === 1 || wordCount < 8) return "okay"
  return "clear"
}

function getClarityHint(text: string): string | null {
  const lower = text.toLowerCase()
  if (lower.includes("users") && !lower.includes("user who") && !lower.includes("user that")) {
    return "Be more specific — which users exactly?"
  }
  if (lower.includes("something")) return "What exactly?"
  if (lower.includes("stuff") || lower.includes("things")) return "Name them specifically."
  if (lower.includes("people")) return "Which people? What role or context?"
  if (lower.includes("maybe") || lower.includes("kind of") || lower.includes("sort of")) {
    return "Be definitive — commit to an answer."
  }
  if (text.trim().split(/\s+/).length < 3) return "Add more detail."
  return null
}

const clarityDot: Record<ClarityLevel, { color: string; label: string }> = {
  empty: { color: "bg-border", label: "Empty" },
  weak: { color: "bg-red-400", label: "Weak" },
  okay: { color: "bg-amber-400", label: "Okay" },
  clear: { color: "bg-emerald-400", label: "Clear" },
}

interface NodeCardProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  multiline?: boolean
  isInput?: boolean
  onGenerate?: () => void
  isGenerating?: boolean
  showClarity?: boolean
}

export function NodeCard({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  isInput = false,
  onGenerate,
  isGenerating = false,
  showClarity = true,
}: NodeCardProps) {
  const [focused, setFocused] = useState(false)
  const clarity = showClarity ? scoreClarity(value) : "empty"
  const hint = showClarity ? getClarityHint(value) : null
  const dot = clarityDot[clarity]

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200",
        "min-w-[200px] max-w-[260px] w-full",
        focused && "shadow-md border-foreground/20",
        isInput && "min-w-[240px] max-w-[300px]",
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground select-none">
          {label}
        </span>
        {showClarity && clarity !== "empty" && (
          <div className="flex items-center gap-1.5" title={dot.label}>
            <span
              className={cn("h-2 w-2 rounded-full flex-shrink-0", dot.color)}
              aria-label={`Clarity: ${dot.label}`}
            />
          </div>
        )}
      </div>

      {/* Text area / input */}
      {multiline || isInput ? (
        <textarea
          className={cn(
            "nodrag",
            "w-full resize-none rounded-lg bg-secondary/50 px-3 py-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground/60 focus:outline-none focus:bg-secondary/80 transition-colors",
            "leading-relaxed",
            isInput ? "min-h-[90px]" : "min-h-[70px]",
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <input
          className={cn(
            "nodrag",
            "w-full rounded-lg bg-secondary/50 px-3 py-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground/60 focus:outline-none focus:bg-secondary/80 transition-colors",
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      )}

      {/* Clarity hint */}
      {showClarity && hint && value.trim().length > 0 && (
        <p className="text-[11px] text-muted-foreground leading-tight">{hint}</p>
      )}

      {/* Generate button */}
      {isInput && onGenerate && (
        <button
          onClick={onGenerate}
          disabled={isGenerating || !value.trim()}
          className={cn(
            "nodrag",
            "mt-1 w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            "bg-foreground text-background",
            "hover:opacity-90 active:scale-[0.98]",
            "disabled:opacity-30 disabled:cursor-not-allowed",
          )}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      )}
    </div>
  )
}
