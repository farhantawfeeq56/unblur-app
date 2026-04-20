"use client"

import { ClarityNode, type ClarityResult } from "@/components/clarity-node"

const GENERIC_WORDS = ["people", "users", "everyone", "anyone"]
const SLIGHTLY_SPECIFIC_WORDS = ["student", "students", "developer", "developers", "designer", "designers", "founder", "founders"]
const ROLE_WORDS = ["founder", "founders", "developer", "developers", "designer", "designers", "student", "students"]
const QUALIFIER_WORDS = ["saas", "ai", "early", "stage", "b2b"]

export const USER_SUGGESTIONS = [
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

interface UserClarityNodeProps {
  value: string
  onChange: (value: string) => void
}

export function UserClarityNode({ value, onChange }: UserClarityNodeProps) {
  return (
    <div className="max-w-md w-full">
      <ClarityNode
        title="User"
        value={value}
        onChange={onChange}
        evaluator={evaluateUserClarity}
        suggestions={USER_SUGGESTIONS}
        placeholder="Describe your target user..."
      />
    </div>
  )
}
