"use client"

import { useState, useCallback, useMemo } from "react"
import { NodeCard } from "@/components/node-card"
import { OutputNode } from "@/components/output-node"
import ReactFlow, {
  Background,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"

// ─── Types ───────────────────────────────────────────────────────────────────

interface NodeState {
  input: string
  problem: string
  user: string
  coreAction: string
  constraints: string
}

interface OutputData {
  productSummary: string
  userFlow: { step: string; description: string }[]
  buildPrompt: string
}

interface FlowCardNodeData {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  multiline?: boolean
  isInput?: boolean
  onGenerate?: () => void
  isGenerating?: boolean
  showClarity?: boolean
  showLeftHandle?: boolean
  showRightHandle?: boolean
}

interface FlowOutputNodeData {
  output: OutputData | null
  showLeftHandle?: boolean
}

function FlowCardNode({ data }: NodeProps<FlowCardNodeData>) {
  return (
    <>
      {data.showLeftHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ width: 8, height: 8, background: "transparent", border: "none" }}
        />
      )}
      <NodeCard
        label={data.label}
        value={data.value}
        onChange={data.onChange}
        placeholder={data.placeholder}
        multiline={data.multiline}
        isInput={data.isInput}
        onGenerate={data.onGenerate}
        isGenerating={data.isGenerating}
        showClarity={data.showClarity}
      />
      {data.showRightHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ width: 8, height: 8, background: "transparent", border: "none" }}
        />
      )}
    </>
  )
}

function FlowOutputNode({ data }: NodeProps<FlowOutputNodeData>) {
  return (
    <>
      {data.showLeftHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ width: 8, height: 8, background: "transparent", border: "none" }}
        />
      )}
      <OutputNode output={data.output} />
    </>
  )
}

const nodeTypes: NodeTypes = {
  flowCard: FlowCardNode,
  flowOutput: FlowOutputNode,
}

// ─── Generation logic (no backend, pure text processing) ──────────────────────

function extractKeyPhrase(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ")
  const sentences = cleaned.split(/[.!?\n]/).map((s) => s.trim()).filter(Boolean)
  return sentences[0] || cleaned.slice(0, 80)
}

function inferProblem(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes("confus") || lower.includes("unclear") || lower.includes("messy")) {
    return "Lack of structure and clarity in the process"
  }
  if (lower.includes("slow") || lower.includes("time") || lower.includes("fast")) {
    return "Time-consuming manual work that slows teams down"
  }
  if (lower.includes("collaborat") || lower.includes("team") || lower.includes("together")) {
    return "Poor collaboration and shared understanding between team members"
  }
  if (lower.includes("track") || lower.includes("monitor") || lower.includes("measure")) {
    return "Difficulty tracking progress and measuring outcomes"
  }
  if (lower.includes("build") || lower.includes("product") || lower.includes("ship")) {
    return "No clear path from idea to shippable product"
  }
  if (lower.includes("communicat") || lower.includes("share") || lower.includes("align")) {
    return "Misalignment and poor communication across stakeholders"
  }
  const key = extractKeyPhrase(input)
  return `No structured approach to: ${key.slice(0, 60)}`
}

function inferUser(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes("designer") || lower.includes("design team")) return "Product designers and design leads"
  if (lower.includes("developer") || lower.includes("engineer") || lower.includes("dev team"))
    return "Software developers and engineering teams"
  if (lower.includes("founder") || lower.includes("startup")) return "Early-stage founders and solo builders"
  if (lower.includes("manager") || lower.includes("pm") || lower.includes("product manager"))
    return "Product managers and team leads"
  if (lower.includes("student") || lower.includes("learn")) return "Students and self-learners"
  if (lower.includes("team") || lower.includes("company") || lower.includes("org"))
    return "Teams building internal tools or products"
  if (lower.includes("creator") || lower.includes("content")) return "Content creators and indie makers"
  return "Teams and individuals building digital products"
}

function inferCoreAction(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes("plan") || lower.includes("roadmap")) return "Plan and prioritize features on a shared roadmap"
  if (lower.includes("write") || lower.includes("document") || lower.includes("spec"))
    return "Write and refine product specs collaboratively"
  if (lower.includes("track") || lower.includes("progress")) return "Track progress and surface blockers in real time"
  if (lower.includes("idea") || lower.includes("brainstorm")) return "Capture and structure ideas into actionable plans"
  if (lower.includes("review") || lower.includes("feedback")) return "Review work and give structured feedback"
  if (lower.includes("analys") || lower.includes("data") || lower.includes("insight"))
    return "Analyze data and extract actionable insights"
  if (lower.includes("design") || lower.includes("prototype")) return "Design and prototype product flows quickly"
  return "Transform unstructured thinking into a clear action plan"
}

function inferConstraints(input: string): string {
  const lower = input.toLowerCase()
  const constraints: string[] = []
  if (lower.includes("no code") || lower.includes("non-technical")) constraints.push("no coding required")
  if (lower.includes("simple") || lower.includes("minimal")) constraints.push("no complex setup or configuration")
  if (lower.includes("free") || lower.includes("cost")) constraints.push("no paid plans or paywalls")
  if (lower.includes("mobile") || lower.includes("phone")) constraints.push("no desktop-only features")
  if (lower.includes("team") || lower.includes("collaborat")) constraints.push("no single-user limitations")
  if (constraints.length === 0) {
    constraints.push("no unnecessary complexity", "no steep learning curve")
  }
  return constraints.join(", ")
}

function buildOutput(nodes: NodeState): OutputData {
  const { problem, user, coreAction, constraints } = nodes

  const p = problem.trim() || "an undefined problem"
  const u = user.trim() || "unspecified users"
  const a = coreAction.trim() || "take action"
  const c = constraints.trim() || "no stated constraints"

  const productSummary = `This is a tool for ${u} to ${a}, solving ${p} — within the bounds of: ${c}.`

  const userFlow = [
    {
      step: "Entry",
      description: `${u.split(" ")[0] || "User"} arrives with a rough idea or existing problem they need to address.`,
    },
    {
      step: "Action",
      description: `They ${a.replace(/^to\s+/i, "").toLowerCase()} using the tool's core workflow.`,
    },
    {
      step: "Outcome",
      description: `The problem — ${p.toLowerCase()} — is resolved, within the constraint that ${c}.`,
    },
  ]

  const buildPrompt = `Build a web app with the following spec:

WHAT TO BUILD:
A tool that helps ${u} to ${a}.

KEY FEATURES:
- Core workflow: ${a}
- Target user: ${u}
- Problem being solved: ${p}

CONSTRAINTS:
- Exclude: ${c}
- Keep the UI minimal and focused
- No unnecessary onboarding or complex configuration

GOAL:
The user opens the app, immediately understands the core action, and completes the flow without friction.`

  return { productSummary, userFlow, buildPrompt }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UnblurPage() {
  const [nodes, setNodes] = useState<NodeState>({
    input: "",
    problem: "",
    user: "",
    coreAction: "",
    constraints: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const updateNode = useCallback(
    (key: keyof NodeState) => (val: string) => {
      setNodes((prev) => ({ ...prev, [key]: val }))
    },
    [],
  )

  // Live output: updates whenever any middle node changes (after first generation)
  const output = useMemo<OutputData | null>(() => {
    if (!hasGenerated) return null
    const hasContent = nodes.problem || nodes.user || nodes.coreAction || nodes.constraints
    if (!hasContent) return null
    return buildOutput(nodes)
  }, [nodes, hasGenerated])

  const handleGenerate = () => {
    if (!nodes.input.trim()) return
    setIsGenerating(true)

    // Simulate slight async feel
    setTimeout(() => {
      setNodes((prev) => ({
        ...prev,
        problem: inferProblem(prev.input),
        user: inferUser(prev.input),
        coreAction: inferCoreAction(prev.input),
        constraints: inferConstraints(prev.input),
      }))
      setHasGenerated(true)
      setIsGenerating(false)
    }, 600)
  }

  const hasAnyMiddleNode = nodes.problem || nodes.user || nodes.coreAction || nodes.constraints
  const flowNodes = useMemo<Node<FlowCardNodeData | FlowOutputNodeData>[]>(
    () => [
      {
        id: "input",
        type: "flowCard",
        position: { x: 0, y: 0 },
        data: {
          label: "Input",
          value: nodes.input,
          onChange: updateNode("input"),
          placeholder: "Dump messy thinking...",
          isInput: true,
          onGenerate: handleGenerate,
          isGenerating,
          showClarity: false,
          showRightHandle: true,
        },
      },
      {
        id: "problem",
        type: "flowCard",
        position: { x: 360, y: 0 },
        data: {
          label: "What is broken?",
          value: nodes.problem,
          onChange: updateNode("problem"),
          placeholder: "Define the core problem...",
          multiline: true,
          showClarity: true,
          showLeftHandle: true,
          showRightHandle: true,
        },
      },
      {
        id: "user",
        type: "flowCard",
        position: { x: 680, y: 0 },
        data: {
          label: "Who is this for?",
          value: nodes.user,
          onChange: updateNode("user"),
          placeholder: "Describe your target user...",
          showClarity: true,
          showLeftHandle: true,
          showRightHandle: true,
        },
      },
      {
        id: "coreAction",
        type: "flowCard",
        position: { x: 1000, y: 0 },
        data: {
          label: "What does user do?",
          value: nodes.coreAction,
          onChange: updateNode("coreAction"),
          placeholder: "Describe the core user action...",
          showClarity: true,
          showLeftHandle: true,
          showRightHandle: true,
        },
      },
      {
        id: "constraints",
        type: "flowCard",
        position: { x: 1320, y: 0 },
        data: {
          label: "What should be excluded?",
          value: nodes.constraints,
          onChange: updateNode("constraints"),
          placeholder: "List what to leave out...",
          showClarity: true,
          showLeftHandle: true,
          showRightHandle: true,
        },
      },
      {
        id: "output",
        type: "flowOutput",
        position: { x: 1680, y: 0 },
        data: {
          output,
          showLeftHandle: true,
        },
      },
    ],
    [nodes, output, updateNode, handleGenerate, isGenerating],
  )

  const flowEdges = useMemo<Edge[]>(
    () => [
      {
        id: "input-problem",
        source: "input",
        target: "problem",
        type: "smoothstep",
        style: { stroke: nodes.input.trim() ? "oklch(0.556 0 0)" : "oklch(0.922 0 0)", strokeWidth: 1 },
      },
      {
        id: "problem-user",
        source: "problem",
        target: "user",
        type: "smoothstep",
        style: { stroke: nodes.problem.trim() ? "oklch(0.556 0 0)" : "oklch(0.922 0 0)", strokeWidth: 1 },
      },
      {
        id: "user-coreAction",
        source: "user",
        target: "coreAction",
        type: "smoothstep",
        style: { stroke: nodes.user.trim() ? "oklch(0.556 0 0)" : "oklch(0.922 0 0)", strokeWidth: 1 },
      },
      {
        id: "coreAction-constraints",
        source: "coreAction",
        target: "constraints",
        type: "smoothstep",
        style: {
          stroke: nodes.coreAction.trim() ? "oklch(0.556 0 0)" : "oklch(0.922 0 0)",
          strokeWidth: 1,
        },
      },
      {
        id: "constraints-output",
        source: "constraints",
        target: "output",
        type: "smoothstep",
        style: { stroke: hasAnyMiddleNode ? "oklch(0.556 0 0)" : "oklch(0.922 0 0)", strokeWidth: 1 },
      },
    ],
    [nodes.input, nodes.problem, nodes.user, nodes.coreAction, hasAnyMiddleNode],
  )

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight text-foreground">Unblur</span>
          <span className="hidden sm:block text-sm text-muted-foreground">
            Turn messy thinking into structured clarity
          </span>
        </div>
        <button
          onClick={() => {
            setNodes({ input: "", problem: "", user: "", coreAction: "", constraints: "" })
            setHasGenerated(false)
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </header>

      {/* Node canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable={false}
          minZoom={0.5}
          maxZoom={1.5}
          defaultViewport={{ x: 60, y: 110, zoom: 1 }}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="oklch(0.922 0 0)" />
        </ReactFlow>
      </div>

      {/* Footer hint */}
      <footer className="border-t border-border/40 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <p className="text-xs text-muted-foreground">
          Type in the Input node, click <strong>Generate</strong> to auto-fill the nodes, then edit freely. Output updates live.
        </p>
      </footer>
    </main>
  )
}
