"use client"

import type { NodeProps } from "reactflow"
import { ClarityNode, type ClarityResult } from "@/components/clarity-node"

type ClarityNodeData = {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  evaluator?: (value: string) => ClarityResult
  suggestions?: string[]
}

export function ReactFlowClarityNode({ data }: NodeProps<ClarityNodeData>) {
  return (
    <div className="w-[320px]">
      <ClarityNode
        title={data.title}
        value={data.value}
        onChange={data.onChange}
        placeholder={data.placeholder}
        evaluator={data.evaluator}
        suggestions={data.suggestions}
      />
    </div>
  )
}
