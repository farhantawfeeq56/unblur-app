"use client"

import { useState } from "react"
import { UserClarityNode } from "@/components/user-clarity-node"
import { cn } from "@/lib/utils"

interface UnblurData {
  user: string
  problem: string
  action: string
  constraints: string
  outcome: string
}

function PlaceholderNode({
  title,
  value,
  onChange,
  placeholder,
}: {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="w-full rounded-xl border bg-card p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase text-muted-foreground">{title}</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-24 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}

export default function UnblurPage() {
  const [data, setData] = useState<UnblurData>({
    user: "",
    problem: "",
    action: "",
    constraints: "",
    outcome: "",
  })
  const [buildPrompt, setBuildPrompt] = useState("")

  const generateBuildPrompt = () => {
    const prompt = `Build a product for ${data.user}.\nThe main problem is: ${data.problem}.\nThe core action is: ${data.action}.\nConstraints: ${data.constraints}.\nSuccess outcome: ${data.outcome}.`
    setBuildPrompt(prompt)
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4">
        <header className="mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Unblur</h1>
          <p className="text-sm text-muted-foreground">Inputs → processed → structured clarity output</p>
        </header>

        <UserClarityNode
          value={data.user}
          onChange={(val) => setData((prev) => ({ ...prev, user: val }))}
        />

        <PlaceholderNode
          title="Problem"
          value={data.problem}
          onChange={(val) => setData((prev) => ({ ...prev, problem: val }))}
          placeholder="Define the core problem..."
        />

        <PlaceholderNode
          title="Core Action"
          value={data.action}
          onChange={(val) => setData((prev) => ({ ...prev, action: val }))}
          placeholder="What does the user need to do?"
        />

        <PlaceholderNode
          title="Constraints"
          value={data.constraints}
          onChange={(val) => setData((prev) => ({ ...prev, constraints: val }))}
          placeholder="What constraints should this solution follow?"
        />

        <PlaceholderNode
          title="Outcome"
          value={data.outcome}
          onChange={(val) => setData((prev) => ({ ...prev, outcome: val }))}
          placeholder="What successful outcome should happen?"
        />

        <section className="w-full rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">Structured Output</h2>

          <div className="space-y-4 text-sm text-foreground">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product Definition</h3>
              <p className="mt-1 leading-relaxed">
                A {data.user || "[user]"} can {data.action || "[action]"} to achieve {data.outcome || "[outcome]"} while
                addressing {data.problem || "[problem]"}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User Flow</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Enter idea</li>
                <li>Refine inputs</li>
                <li>Get structured clarity</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Constraints</h3>
              <p className={cn("mt-1 leading-relaxed", !data.constraints && "text-muted-foreground")}>
                {data.constraints || "No constraints provided yet."}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Failure Cases</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>vague inputs</li>
                <li>unclear problem</li>
                <li>conflicting inputs</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="w-full rounded-xl border bg-card p-4 shadow-sm">
          <button
            type="button"
            onClick={generateBuildPrompt}
            className="rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Generate Build Prompt
          </button>

          {buildPrompt && (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-secondary/50 p-3 text-xs leading-relaxed text-foreground">
              {buildPrompt}
            </pre>
          )}
        </section>
      </div>
    </main>
  )
}
