"use client"

import type { NodeProps } from "reactflow"
import { ClarityNode } from "@/components/clarity-node"
import { useUnblurData } from "@/components/data-context"
import { ClarityNodeData, UnblurData } from "@/lib/types"

export function ReactFlowClarityNode({ id, data }: NodeProps<ClarityNodeData>) {
  const { data: unblurData, onFieldChange } = useUnblurData()

  const field = id as keyof UnblurData
  const value = unblurData[field] || ""

  return (
    <div className="w-[320px]">
      <ClarityNode
        title={data.title}
        value={value}
        onChange={(val) => onFieldChange(field, val)}
        placeholder={data.placeholder}
        evaluator={data.evaluator}
        suggestions={data.suggestions}
      />
    </div>
  )
}
