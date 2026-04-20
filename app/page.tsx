"use client"

import { useMemo, useState } from "react"
import ReactFlow, { Background, type Node } from "reactflow"
import { ReactFlowClarityNode } from "@/components/reactflow-clarity-node"
import { evaluateUserClarity, USER_SUGGESTIONS } from "@/components/user-clarity-node"

interface UnblurData {
  user: string
  problem: string
  action: string
  constraints: string
  outcome: string
}

type ClarityNodeData = {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  evaluator?: (value: string) => { score: number; state: "empty" | "weak" | "medium" | "strong"; feedback: string }
  suggestions?: string[]
}

const nodeTypes = {
  clarityNode: ReactFlowClarityNode,
}

export default function UnblurPage() {
  const [data, setData] = useState<UnblurData>({
    user: "",
    problem: "",
    action: "",
    constraints: "",
    outcome: "",
  })

  const nodes = useMemo<Node<ClarityNodeData>[]>(
    () => [
      {
        id: "user",
        type: "clarityNode",
        position: { x: 0, y: 0 },
        data: {
          title: "User",
          value: data.user,
          onChange: (val) => setData((prev) => ({ ...prev, user: val })),
          placeholder: "Describe your target user...",
          evaluator: evaluateUserClarity,
          suggestions: USER_SUGGESTIONS,
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
          placeholder: "Define the core problem...",
          suggestions: [],
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
          placeholder: "What does the user need to do?",
          suggestions: [],
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
          placeholder: "What constraints should this solution follow?",
          suggestions: [],
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
          placeholder: "What successful outcome should happen?",
          suggestions: [],
        },
      },
    ],
    [data],
  )

  return (
    <main className="h-screen w-screen overflow-hidden bg-muted/20">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <header className="shrink-0 px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight">Unblur</h1>
        </header>

        <div className="h-full w-full flex-1">
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll
            panOnScroll
            panOnDrag={false}
            selectionOnDrag
            className="h-full w-full"
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background gap={24} size={1} color="hsl(var(--border))" />
          </ReactFlow>
        </div>
      </div>
    </main>
  )
}
