"use client"

import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"

interface UnblurData {
  user: string
  problem: string
  action: string
  constraints: string
  outcome: string
}

interface OutputNodeProps {
  data: UnblurData
}

const fallback = {
  user: "user",
  problem: "problem",
  action: "take action",
  constraints: "constraints",
  outcome: "an outcome",
}

export function OutputNode({ data }: OutputNodeProps) {
  const user = data.user || fallback.user
  const problem = data.problem || fallback.problem
  const action = data.action || fallback.action
  const constraints = data.constraints || fallback.constraints
  const outcome = data.outcome || fallback.outcome

  const productStatement = `A ${user} can ${action} to achieve ${outcome} while addressing ${problem}`
  const buildPrompt = `Build a clarity-focused product concept for ${user}.\nProblem to solve: ${problem}.\nCore action: ${action}.\nDesired outcome: ${outcome}.\nConstraints: ${constraints}.\nGenerate a concise plan with assumptions, flow, and risks.`

  return (
    <div className={cn("relative flex w-full flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm", "min-w-[320px]")}>
      <Handle type="target" position={Position.Left} />

      <div className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground select-none">Output</div>

      <section className="flex flex-col gap-1">
        <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Product Statement</h3>
        <p className="text-sm leading-relaxed text-foreground">{productStatement}</p>
      </section>

      <div className="h-px bg-border" />

      <section className="flex flex-col gap-2">
        <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">User Flow</h3>
        <ol className="list-decimal space-y-1 pl-4 text-sm leading-relaxed text-foreground">
          <li>Enter idea</li>
          <li>Refine inputs</li>
          <li>Get structured clarity</li>
        </ol>
      </section>

      <div className="h-px bg-border" />

      <section className="flex flex-col gap-1">
        <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Constraints</h3>
        <p className="text-sm leading-relaxed text-foreground">{constraints}</p>
      </section>

      <div className="h-px bg-border" />

      <section className="flex flex-col gap-1">
        <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Failure Cases</h3>
        <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-foreground">
          <li>vague inputs</li>
          <li>unclear problem</li>
          <li>conflicting inputs</li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="flex flex-col gap-1">
        <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Build Prompt</h3>
        <pre className="rounded-lg bg-secondary/50 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground">
          {buildPrompt}
        </pre>
      </section>
    </div>
  )
}
