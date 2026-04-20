"use client"

import type { NodeProps } from "reactflow"
import { OutputNode } from "@/components/output-node"
import { useUnblurData } from "@/components/data-context"
import { OutputNodeData } from "@/lib/types"

export function ReactFlowOutputNode({ data }: NodeProps<OutputNodeData>) {
  const { data: unblurData } = useUnblurData()

  return (
    <div className="w-[420px]">
      <OutputNode data={unblurData} />
    </div>
  )
}
