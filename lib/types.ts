export type ClarityState = "empty" | "weak" | "medium" | "strong"

export interface ClarityResult {
  score: number
  state: ClarityState
  feedback: string
}

export interface UnblurData {
  user: string
  problem: string
  action: string
  constraints: string
  outcome: string
}

export type ClarityNodeData = {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  evaluator?: (value: string) => ClarityResult
  suggestions?: string[]
}

export type OutputNodeData = {
  data: UnblurData
}

export type CanvasNodeData = ClarityNodeData | OutputNodeData
