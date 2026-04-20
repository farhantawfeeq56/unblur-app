"use client"

import { useMemo, useState } from "react"
import ReactFlow, { Background, type Node, type NodeProps, type NodeTypes } from "reactflow"
import { ClarityNode, type ClarityResult } from "@/components/clarity-node"
import { USER_SUGGESTIONS, evaluateUserClarity } from "@/components/user-clarity-node"
import { cn } from "@/lib/utils"
import "reactflow/dist/style.css"

interface UnblurData {
  user: string
  problem: string
  action: string
  constraints: string
  outcome: string
}

interface ClarityFlowNodeData {
  title: string
  value: string
  onChange: (value: string) => void
  evaluator: (value: string) => ClarityResult
  suggestions?: string[]
  placeholder?: string
}

function createBasicEvaluator(label: string): (value: string) => ClarityResult {
  return (value: string) => {
    const input = value.trim()

    if (!input) {
      return { score: 0, state: "empty", feedback: `Add ${label.toLowerCase()} details.` }
    }

    if (input.length < 12) {
      return { score: 35, state: "weak", feedback: `Too vague. Clarify the ${label.toLowerCase()}.` }
    }

    if (input.length < 30) {
      return { score: 65, state: "medium", feedback: `Good start. Add more specifics to the ${label.toLowerCase()}.` }
    }

    return { score: 85, state: "strong", feedback: `${label} looks clear.` }
  }
}

const evaluateProblemClarity = createBasicEvaluator("Problem")
const evaluateActionClarity = createBasicEvaluator("Core Action")
const evaluateConstraintsClarity = createBasicEvaluator("Constraints")
const evaluateOutcomeClarity = createBasicEvaluator("Outcome")

function FlowClarityNode({ data }: NodeProps<ClarityFlowNodeData>) {
  return (
    <div className="w-[320px]">
      <ClarityNode
        title={data.title}
        value={data.value}
        onChange={data.onChange}
        evaluator={data.evaluator}
        suggestions={data.suggestions}
        placeholder={data.placeholder}
      />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  clarityNode: FlowClarityNode,
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

  const nodes = useMemo<Node<ClarityFlowNodeData>[]>(
    () => [
      {
        id: "user",
        type: "clarityNode",
        position: { x: 0, y: 0 },
        data: {
          title: "User",
          value: data.user,
          onChange: (val) => setData((prev) => ({ ...prev, user: val })),
          evaluator: evaluateUserClarity,
          suggestions: USER_SUGGESTIONS,
          placeholder: "Describe your target user...",
        },
      },
      {
        id: "problem",
        type: "clarityNode",
        position: { x: 0, y: 150 },
        data: {
          title: "Problem",
          value: data.problem,
          onChange: (val) => setData((prev) => ({ ...prev, problem: val })),
          evaluator: evaluateProblemClarity,
          placeholder: "Define the core problem...",
        },
      },
      {
        id: "action",
        type: "clarityNode",
        position: { x: 0, y: 300 },
        data: {
          title: "Core Action",
          value: data.action,
          onChange: (val) => setData((prev) => ({ ...prev, action: val })),
          evaluator: evaluateActionClarity,
          placeholder: "What does the user do?",
        },
      },
      {
        id: "constraints",
        type: "clarityNode",
        position: { x: 0, y: 450 },
        data: {
          title: "Constraints",
          value: data.constraints,
          onChange: (val) => setData((prev) => ({ ...prev, constraints: val })),
          evaluator: evaluateConstraintsClarity,
          placeholder: "What constraints apply?",
        },
      },
      {
        id: "outcome",
        type: "clarityNode",
        position: { x: 0, y: 600 },
        data: {
          title: "Outcome",
          value: data.outcome,
          onChange: (val) => setData((prev) => ({ ...prev, outcome: val })),
          evaluator: evaluateOutcomeClarity,
          placeholder: "What successful outcome should happen?",
        },
      },
    ],
    [data],
  )

  const generateBuildPrompt = () => {
    const prompt = `Build a product for ${data.user}.\nThe main problem is: ${data.problem}.\nThe core action is: ${data.action}.\nConstraints: ${data.constraints}.\nSuccess outcome: ${data.outcome}.`
    setBuildPrompt(prompt)
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
        <section className="w-full rounded-xl border bg-card p-2 shadow-sm lg:w-[380px]">
          <div className="mb-2 px-2 pt-2">
            <h1 className="text-base font-semibold tracking-tight">Unblur</h1>
            <p className="text-xs text-muted-foreground">Structured convergence flow</p>
          </div>
          <div className="h-[760px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={[]}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              zoomOnDoubleClick={false}
              panOnDrag={false}
              zoomOnScroll={false}
              preventScrolling={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={20} size={1} color="oklch(0.922 0 0)" />
            </ReactFlow>
          </div>
        </section>

        <section className="w-full rounded-xl border bg-card p-4 shadow-sm lg:flex-1">
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
                <li>Enter input</li>
                <li>Refine thinking</li>
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

          <div className="mt-5 border-t border-border pt-4">
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
          </div>
        </section>
      </div>
    </main>
  )
}
