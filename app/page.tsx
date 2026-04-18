"use client"

import { useState, useCallback, useMemo } from "react"
import { NodeCard } from "@/components/node-card"
import { ConnectorLine } from "@/components/connector-line"
import { OutputNode } from "@/components/output-node"

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

      {/* Node chain — horizontally scrollable */}
      <div className="flex-1 flex items-center overflow-x-auto">
        <div className="flex items-start gap-0 px-8 py-10 mx-auto">

          {/* 1. Input Node */}
          <NodeCard
            label="Input"
            value={nodes.input}
            onChange={updateNode("input")}
            placeholder="Dump messy thinking..."
            isInput
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            showClarity={false}
          />

          <ConnectorLine active={!!nodes.input.trim()} />

          {/* 2. Problem Node */}
          <NodeCard
            label="What is broken?"
            value={nodes.problem}
            onChange={updateNode("problem")}
            placeholder="Define the core problem..."
            multiline
            showClarity
          />

          <ConnectorLine active={!!nodes.problem.trim()} />

          {/* 3. User Node */}
          <NodeCard
            label="Who is this for?"
            value={nodes.user}
            onChange={updateNode("user")}
            placeholder="Describe your target user..."
            showClarity
          />

          <ConnectorLine active={!!nodes.user.trim()} />

          {/* 4. Core Action Node */}
          <NodeCard
            label="What does user do?"
            value={nodes.coreAction}
            onChange={updateNode("coreAction")}
            placeholder="Describe the core user action..."
            showClarity
          />

          <ConnectorLine active={!!nodes.coreAction.trim()} />

          {/* 5. Constraints Node */}
          <NodeCard
            label="What should be excluded?"
            value={nodes.constraints}
            onChange={updateNode("constraints")}
            placeholder="List what to leave out..."
            showClarity
          />

          <ConnectorLine active={!!hasAnyMiddleNode} />

          {/* 6. Output Node */}
          <OutputNode output={output} />
        </div>
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
