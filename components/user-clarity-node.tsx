"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type ClarityState = "empty" | "weak" | "medium" | "strong"

interface ClarityResult {
  score: number
  state: ClarityState
  feedback: string
}

const GENERIC_WORDS = ["people", "users", "everyone", "anyone"]
const SLIGHTLY_SPECIFIC_WORDS = ["student", "students", "developer", "developers", "designer", "designers", "founder", "founders"]
const ROLE_WORDS = ["founder", "founders", "developer", "developers", "designer", "designers", "student", "students"]
const QUALIFIER_WORDS = ["saas", "ai", "early", "stage", "b2b"]

const SUGGESTIONS = [
  "SaaS founders (B2B tools)",
  "Indie hackers building solo products",
  "AI startup founders (early-stage)",
  "Freelance designers working with startups",
]

function includesAnyWord(input: string, words: string[]): boolean {
  const tokens = input.split(/\W+/).filter(Boolean)
  return words.some((word) => tokens.includes(word))
}

export function evaluateUserClarity(text: string): ClarityResult {
  const input = text.trim()
  const lower = input.toLowerCase()

  if (!input) {
    return {
      score: 0,
      state: "empty",
      feedback: "Start by describing who this is for.",
    }
  }

  const hasRole = includesAnyWord(lower, ROLE_WORDS)
  const hasQualifier = includesAnyWord(lower, QUALIFIER_WORDS)

  if (hasRole && hasQualifier) {
    return {
      score: 85,
      state: "strong",
      feedback: "Good. This is specific and clear.",
    }
  }

  if (includesAnyWord(lower, GENERIC_WORDS)) {
    return {
      score: 30,
      state: "weak",
      feedback: "Too broad. Be more specific about the type of user.",
    }
  }

  if (includesAnyWord(lower, SLIGHTLY_SPECIFIC_WORDS)) {
    return {
      score: 60,
      state: "medium",
      feedback: "Which type exactly? (e.g., SaaS, AI, early-stage)",
    }
  }

  if (input.length < 15) {
    return {
      score: 20,
      state: "weak",
      feedback: "Too vague. Who exactly?",
    }
  }

  return {
    score: 45,
    state: "medium",
    feedback: "Good start. Add role and context to make it clearer.",
  }
}

const stateStyles: Record<ClarityState, string> = {
  empty: "border-border text-muted-foreground",
  weak: "border-red-400 text-red-600",
  medium: "border-amber-400 text-amber-600",
  strong: "border-emerald-400 text-emerald-600",
}

export function UserClarityNode() {
  const [value, setValue] = useState("")
  const result = useMemo(() => evaluateUserClarity(value), [value])

  return (
    <div className="flex flex-col gap-3 max-w-md w-full">
      <div className={cn("rounded-xl border bg-card p-4 shadow-sm", stateStyles[result.state])}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide uppercase">User</h2>
          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", stateStyles[result.state])}>
            {result.score}%
          </span>
        </div>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe your target user..."
          className="min-h-24 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <p className="mt-2 text-xs">{result.feedback}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setValue(suggestion)}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:bg-secondary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
