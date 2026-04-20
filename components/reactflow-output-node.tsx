"use client"

import type { NodeProps } from "reactflow"
import { OutputNode } from "@/components/output-node"

interface UnblurData {
  user: string
  problem: string
  action: string
  constraints: string
  outcome: string
}

type OutputNodeData = {
  data: UnblurData
}

export function ReactFlowOutputNode({ data }: NodeProps<OutputNodeData>) {
  return (
    <div className="w-[420px]">
      <OutputNode data={data.data} />
    </div>
  )
}
