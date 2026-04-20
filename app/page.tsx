"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ReactFlow, { Background, type Edge, type Node, useEdgesState, useNodesState, type NodeChange } from "reactflow"
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

type CanvasNodeData = ClarityNodeData | OutputNodeData

const CENTER_X = 400
const MIN_VERTICAL_GAP = 140
const MIN_HORIZONTAL_GAP = 120
const orderedIds = ["user", "problem", "action", "constraints", "outcome", "output"] as const
const yById: Record<(typeof orderedIds)[number], number> = {
  user: 0,
  problem: 160,
  action: 320,
  constraints: 480,
  outcome: 640,
  output: 900,
}

const initialData: UnblurData = {
  user: "",
  problem: "",
  action: "",
  constraints: "",
  outcome: "",
}

const inputEdgeIds = ["user", "problem", "action", "constraints", "outcome"] as const

const initialEdges: Edge[] = inputEdgeIds.map((id) => ({
  id: `e-${id}-output`,
  source: id,
  target: "output",
  type: "bezier",
  animated: true,
  className: "flow-edge",
  style: {
    stroke: "url(#edge-gradient)",
    strokeWidth: 2,
    strokeDasharray: Math.random() > 0.5 ? "5 5" : "6 8",
    opacity: Math.random() > 0.5 ? 0.66 : 0.76,
  },
}))

const nodeTypes = {
  clarityNode: ReactFlowClarityNode,
  outputNode: ReactFlowOutputNode,
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function getNodeScore(nodeId: string, data: UnblurData): number {
  if (nodeId === "user") {
    return evaluateUserClarity(data.user).score
  }

  const value = data[nodeId as keyof UnblurData]?.trim() ?? ""
  if (!value) return 0
  if (value.length < 30) return 35
  if (value.length < 80) return 60
  return 82
}

function resolveCollisions(nodes: Node<CanvasNodeData>[]) {
  const updated = nodes.map((node) => ({
    ...node,
    position: { ...node.position },
  }))

  for (let i = 0; i < updated.length; i++) {
    for (let j = i + 1; j < updated.length; j++) {
      const a = updated[i]
      const b = updated[j]
      const dx = Math.abs(a.position.x - b.position.x)
      const dy = Math.abs(a.position.y - b.position.y)

      if (dy < MIN_VERTICAL_GAP && dx < MIN_HORIZONTAL_GAP) {
        const push = MIN_HORIZONTAL_GAP / 2
        updated[j].position.x = lerp(updated[j].position.x, updated[j].position.x + push, 0.1)
        updated[i].position.x = lerp(updated[i].position.x, updated[i].position.x - push, 0.1)
      }
    }
  }

  return updated
}

export default function UnblurPage() {
  const [data, setData] = useState<UnblurData>(initialData)
  const isDraggingRef = useRef(false)

  const onFieldChange = useCallback((field: keyof UnblurData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const initialNodes = useMemo<Node<CanvasNodeData>[]>(
    () => [
      {
        id: "user",
        type: "clarityNode",
        position: { x: 300 + Math.random() * 200, y: yById.user },
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
        position: { x: 300 + Math.random() * 200, y: yById.problem },
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
        position: { x: 300 + Math.random() * 200, y: yById.action },
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
        position: { x: 300 + Math.random() * 200, y: yById.constraints },
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
        position: { x: 300 + Math.random() * 200, y: yById.outcome },
        data: {
          title: "Outcome",
          value: initialData.outcome,
          onChange: (val: string) => onFieldChange("outcome", val),
          placeholder: "What successful outcome should happen?",
          suggestions: [],
        },
      },
      {
        id: "output",
        type: "outputNode",
        position: { x: CENTER_X, y: yById.output },
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (isDraggingRef.current) return

      const overallClarity = inputEdgeIds.reduce((sum, id) => sum + getNodeScore(id, data), 0) / inputEdgeIds.length

      setNodes((prevNodes) => {
        const order = new Map(orderedIds.map((id, index) => [id, index]))
        const ordered = [...prevNodes].sort((a, b) => (order.get(a.id as (typeof orderedIds)[number]) ?? 999) - (order.get(b.id as (typeof orderedIds)[number]) ?? 999))

        const aligned = ordered.map((node) => {
          const targetY = yById[node.id as (typeof orderedIds)[number]] ?? node.position.y

          if (node.id === "output") {
            return {
              ...node,
              position: {
                x: lerp(node.position.x, CENTER_X, 0.08),
                y: targetY,
              },
            }
          }

          const randomOffset = (Math.random() - 0.5) * 100
          const lowClarityTargetX = CENTER_X + randomOffset
          const midClarityTargetX = lerp(node.position.x, CENTER_X, 0.06)

          let targetX = node.position.x
          if (overallClarity < 40) targetX = lowClarityTargetX
          else if (overallClarity <= 70) targetX = midClarityTargetX
          else targetX = CENTER_X

          return {
            ...node,
            position: {
              x: lerp(node.position.x, targetX, 0.08),
              y: targetY,
            },
          }
        })

        return resolveCollisions(aligned)
      })
    }, 120)

    return () => window.clearInterval(timer)
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
            onNodeDragStart={() => {
              isDraggingRef.current = true
            }}
            onNodeDragStop={() => {
              isDraggingRef.current = false
            }}
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
            <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
              <defs>
                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
                </linearGradient>
              </defs>
            </svg>
            <Background gap={24} size={1} color="hsl(var(--border))" />
          </ReactFlow>
        </div>
      </div>
    </main>
  )
}
