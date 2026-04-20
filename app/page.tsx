"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import ReactFlow, {
  Background,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
  type NodeChange,
} from "reactflow"
import { ReactFlowClarityNode } from "@/components/reactflow-clarity-node"
import { ReactFlowOutputNode } from "@/components/reactflow-output-node"
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

type OutputNodeData = {
  data: UnblurData
}

type CanvasNodeData = ClarityNodeData | OutputNodeData | { label: string }

const initialData: UnblurData = {
  user: "",
  problem: "",
  action: "",
  constraints: "",
  outcome: "",
}

const initialEdges: Edge[] = [
  { id: "e-user-engine", source: "user", target: "engine", type: "smoothstep" },
  { id: "e-problem-engine", source: "problem", target: "engine", type: "smoothstep" },
  { id: "e-action-engine", source: "action", target: "engine", type: "smoothstep" },
  { id: "e-constraints-engine", source: "constraints", target: "engine", type: "smoothstep" },
  { id: "e-outcome-engine", source: "outcome", target: "engine", type: "smoothstep" },
  { id: "e-engine-output", source: "engine", target: "output", type: "smoothstep" },
]

const nodeTypes = {
  clarityNode: ReactFlowClarityNode,
  outputNode: ReactFlowOutputNode,
}

export default function UnblurPage() {
  const [data, setData] = useState<UnblurData>(initialData)

  const onFieldChange = useCallback((field: keyof UnblurData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const initialNodes = useMemo<Node<CanvasNodeData>[]>(
    () => [
      {
        id: "user",
        type: "clarityNode",
        position: { x: 0, y: 0 },
        data: {
          title: "User",
          value: initialData.user,
          onChange: (val: string) => onFieldChange("user", val),
          placeholder: "Describe your target user...",
          evaluator: evaluateUserClarity,
          suggestions: USER_SUGGESTIONS,
        },
      },
      {
        id: "problem",
        type: "clarityNode",
        position: { x: 0, y: 180 },
        data: {
          title: "Problem",
          value: initialData.problem,
          onChange: (val: string) => onFieldChange("problem", val),
          placeholder: "Define the core problem...",
          suggestions: [],
        },
      },
      {
        id: "action",
        type: "clarityNode",
        position: { x: 0, y: 360 },
        data: {
          title: "Core Action",
          value: initialData.action,
          onChange: (val: string) => onFieldChange("action", val),
          placeholder: "What does the user need to do?",
          suggestions: [],
        },
      },
      {
        id: "constraints",
        type: "clarityNode",
        position: { x: 0, y: 540 },
        data: {
          title: "Constraints",
          value: initialData.constraints,
          onChange: (val: string) => onFieldChange("constraints", val),
          placeholder: "What constraints should this solution follow?",
          suggestions: [],
        },
      },
      {
        id: "outcome",
        type: "clarityNode",
        position: { x: 0, y: 720 },
        data: {
          title: "Outcome",
          value: initialData.outcome,
          onChange: (val: string) => onFieldChange("outcome", val),
          placeholder: "What successful outcome should happen?",
          suggestions: [],
        },
      },
      {
        id: "engine",
        type: "default",
        position: { x: 350, y: 360 },
        data: { label: "Clarity Engine" },
      },
      {
        id: "output",
        type: "outputNode",
        position: { x: 750, y: 360 },
        data: { data: initialData },
      },
    ],
    [onFieldChange],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNodeData>(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === "output") {
          return { ...node, data: { data } }
        }

        if (node.type === "clarityNode") {
          const keyMap: Record<string, keyof UnblurData> = {
            user: "user",
            problem: "problem",
            action: "action",
            constraints: "constraints",
            outcome: "outcome",
          }

          const field = keyMap[node.id]
          if (!field) return node

          return {
            ...node,
            data: {
              ...(node.data as ClarityNodeData),
              value: data[field],
            },
          }
        }

        return node
      }),
    )
  }, [data, setNodes])

  return (
    <main className="h-screen w-screen overflow-hidden bg-muted/20">
      <div className="flex h-full w-full min-w-[1200px] flex-col overflow-hidden">
        <header className="shrink-0 px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight">Unblur</h1>
        </header>

        <div className="h-full w-full flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            zoomOnScroll
            panOnDrag
            className="h-full w-full"
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background gap={24} size={1} color="hsl(var(--border))" />
          </ReactFlow>
        </div>
      </div>
    </main>
  )
}
