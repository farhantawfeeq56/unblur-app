"use client"

import { useCallback, useMemo, useEffect, useState } from "react"
import ReactFlow, { 
  Background, 
  type Edge, 
  type Node, 
  useEdgesState, 
  useNodesState, 
  type NodeChange,
  ReactFlowProvider,
  useReactFlow,
  useViewport
} from "reactflow"

import { ReactFlowClarityNode } from "@/components/reactflow-clarity-node"
import { ReactFlowOutputNode } from "@/components/reactflow-output-node"
import { evaluateUserClarity, USER_SUGGESTIONS } from "@/components/user-clarity-node"
import { DataProvider } from "@/components/data-context"
import { CanvasNodeData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Maximize, Settings2 } from "lucide-react"
import { SetupOverlay, type WarehouseConfig } from "@/components/setup-overlay"

const INPUT_NODES = ["user", "problem", "action", "constraints", "outcome"]
const CLARITY_NODE_WIDTH = 320
const OUTPUT_NODE_WIDTH = 420

const WORKING_PADDING = 0.3
const FOCUS_PADDING = 0.8

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
  const { fitView } = useReactFlow()
  const { zoom } = useViewport()

  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [config, setConfig] = useState<WarehouseConfig | null>(null)

  useEffect(() => {
    const savedConfig = localStorage.getItem('warehouse-config')
    if (!savedConfig) {
      setIsSetupOpen(true)
    } else {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const handleSetupComplete = useCallback((newConfig: WarehouseConfig) => {
    setConfig(newConfig)
    setIsSetupOpen(false)
  }, [])

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  const handleResetView = useCallback(() => {
    fitView({ duration: 600, padding: WORKING_PADDING })
  }, [fitView])

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      fitView({ nodes: [node], padding: FOCUS_PADDING, duration: 600 })
    },
    [fitView]
  )

  const handlePaneClick = useCallback(() => {
    handleResetView()
  }, [handleResetView])

  const visualStyle = useMemo(() => {
    const edgeOpacity = Math.min(1.0, Math.max(0.2, 0.3 + (zoom - 0.5) * 0.7))
    const shadowIntensity = Math.min(0.3, Math.max(0.05, 0.1 + (zoom - 0.7) * 0.4))
    const shadowBlur = Math.max(2, 3 + (zoom - 0.7) * 10)
    
    return {
      "--edge-opacity": edgeOpacity.toString(),
      "--node-shadow": `0 ${shadowBlur / 2}px ${shadowBlur}px rgba(0,0,0,${shadowIntensity})`,
    } as React.CSSProperties
  }, [zoom])

  useEffect(() => {
    // Initial comfortable view
    setTimeout(() => {
      fitView({ duration: 800, padding: WORKING_PADDING })
    }, 100)
  }, [fitView])

  return (
    <div 
      className="flex h-full w-full min-w-[1200px] flex-col overflow-hidden"
      style={visualStyle}
    >
      <header className="flex shrink-0 items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-md border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Unblurr
          </h1>
          {config && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border text-[11px] font-medium text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {config.layout} • {config.density}% Density
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSetupOpen(true)}
            className="gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Settings2 className="h-4 w-4" />
            Change Layout
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetView}
            className="gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Maximize className="h-4 w-4" />
            Reset View
          </Button>
        </div>
      </header>

      <div className="h-full w-full flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          zoomOnScroll
          panOnDrag
          className="h-full w-full"
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

      <SetupOverlay 
        isOpen={isSetupOpen} 
        onComplete={handleSetupComplete} 
        onClose={config ? () => setIsSetupOpen(false) : undefined}
      />
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
