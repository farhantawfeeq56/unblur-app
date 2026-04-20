"use client"

import { useCallback, useMemo, useEffect } from "react"
import ReactFlow, { 
  Background, 
  type Edge, 
  type Node, 
  useEdgesState, 
  useNodesState, 
  type NodeChange,
  ReactFlowProvider,
  useReactFlow
} from "reactflow"

import { ReactFlowClarityNode } from "@/components/reactflow-clarity-node"
import { ReactFlowOutputNode } from "@/components/reactflow-output-node"
import { evaluateUserClarity, USER_SUGGESTIONS } from "@/components/user-clarity-node"
import { DataProvider } from "@/components/data-context"
import { CanvasNodeData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

const INPUT_NODES = ["user", "problem", "action", "constraints", "outcome"]
const CLARITY_NODE_WIDTH = 320
const OUTPUT_NODE_WIDTH = 420

const yById = {
  user: 0,
  problem: 0,
  action: 0,
  constraints: 0,
  outcome: 0,
  output: 600,
} as const

const getNodeX = (id: string, totalWidth: number) => {
  const inputIndex = INPUT_NODES.indexOf(id)
  if (inputIndex !== -1) {
    return (inputIndex * (totalWidth - CLARITY_NODE_WIDTH)) / 4
  }
  if (id === "output") {
    return (totalWidth - OUTPUT_NODE_WIDTH) / 2
  }
  return 0
}

const initialEdges: Edge[] = [
  { id: "e-user-output", source: "user", target: "output" },
  { id: "e-problem-output", source: "problem", target: "output" },
  { id: "e-action-output", source: "action", target: "output" },
  { id: "e-constraints-output", source: "constraints", target: "output" },
  { id: "e-outcome-output", source: "outcome", target: "output" },
].map((edge) => ({
  ...edge,
  animated: true,
  className: "flow-edge",
  style: {
    stroke: "url(#edge-gradient)",
    strokeWidth: 2,
    opacity: 0.7,
  },
}))

const nodeTypes = {
  clarityNode: ReactFlowClarityNode,
  outputNode: ReactFlowOutputNode,
}

const LAYOUT_WIDTH = 2000

const initialNodes: Node<CanvasNodeData>[] = [
  {
    id: "user",
    type: "clarityNode",
    position: { x: getNodeX("user", LAYOUT_WIDTH), y: yById.user },
    data: {
      title: "User",
      value: "",
      onChange: () => {},
      placeholder: "Describe your target user...",
      evaluator: evaluateUserClarity,
      suggestions: USER_SUGGESTIONS,
    },
  },
  {
    id: "problem",
    type: "clarityNode",
    position: { x: getNodeX("problem", LAYOUT_WIDTH), y: yById.problem },
    data: {
      title: "Problem",
      value: "",
      onChange: () => {},
      placeholder: "Define the core problem...",
      suggestions: [],
    },
  },
  {
    id: "action",
    type: "clarityNode",
    position: { x: getNodeX("action", LAYOUT_WIDTH), y: yById.action },
    data: {
      title: "Core Action",
      value: "",
      onChange: () => {},
      placeholder: "What does the user need to do?",
      suggestions: [],
    },
  },
  {
    id: "constraints",
    type: "clarityNode",
    position: { x: getNodeX("constraints", LAYOUT_WIDTH), y: yById.constraints },
    data: {
      title: "Constraints",
      value: "",
      onChange: () => {},
      placeholder: "What constraints should this solution follow?",
      suggestions: [],
    },
  },
  {
    id: "outcome",
    type: "clarityNode",
    position: { x: getNodeX("outcome", LAYOUT_WIDTH), y: yById.outcome },
    data: {
      title: "Outcome",
      value: "",
      onChange: () => {},
      placeholder: "What successful outcome should happen?",
      suggestions: [],
    },
  },
  {
    id: "output",
    type: "outputNode",
    position: { x: getNodeX("output", LAYOUT_WIDTH), y: yById.output },
    data: { data: { user: "", problem: "", action: "", constraints: "", outcome: "" } },
  },
]

function UnblurCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNodeData>(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const { setViewport, fitView } = useReactFlow()

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  const alignNodes = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        position: {
          x: getNodeX(node.id, LAYOUT_WIDTH),
          y: yById[node.id as keyof typeof yById] ?? node.position.y,
        },
      }))
    )
    // Small delay to ensure React Flow has updated node positions before fitting view
    setTimeout(() => fitView({ duration: 400, padding: 0.3 }), 50)
  }, [setNodes, fitView])

  useEffect(() => {
    alignNodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-full w-full min-w-[1200px] flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-md border-b">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Unblurr
        </h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={alignNodes}
          className="gap-2 shadow-sm hover:shadow-md transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Align Canvas
        </Button>
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
  )
}

export default function UnblurPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-muted/20">
      <ReactFlowProvider>
        <DataProvider>
          <UnblurCanvas />
        </DataProvider>
      </ReactFlowProvider>
    </main>
  )
}
