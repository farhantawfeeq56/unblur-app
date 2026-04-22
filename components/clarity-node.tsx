"use client"

import { useMemo, useRef, useLayoutEffect } from "react"
import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"
import { ClarityState, ClarityResult } from "@/lib/types"

interface ClarityNodeProps {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  evaluator?: (value: string) => ClarityResult
  suggestions?: string[]
}

const stateStyles: Record<ClarityState, string> = {
  empty: "border-border text-muted-foreground",
  weak: "border-red-400 text-red-600",
  medium: "border-amber-400 text-amber-600",
  strong: "border-emerald-400 text-emerald-600",
}

const VAGUE_WORDS = ["people", "users", "everyone", "anyone", "something", "stuff", "things", "someone", "maybe", "kind of", "sort of", "etc", "various", "many"];
const SPECIFIC_WORDS = ["student", "students", "developer", "developers", "designer", "designers", "founder", "founders", "engineer", "engineers", "manager", "managers", "builder", "builders"];
const QUALIFIER_WORDS = ["saas", "ai", "early", "stage", "b2b", "b2c", "mobile", "web", "startup"];

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlight(text: string) {
  if (!text) return ""
  
  const rules = [
    { list: VAGUE_WORDS, class: "text-red-500 bg-red-500/10 px-0.5 rounded" },
    { list: SPECIFIC_WORDS, class: "text-emerald-500 bg-emerald-500/10 px-0.5 rounded" },
    { list: QUALIFIER_WORDS, class: "text-blue-500 bg-blue-500/10 px-0.5 rounded" },
  ]

  const allPatterns = Array.from(new Set(rules.flatMap(r => r.list))).sort((a, b) => b.length - a.length)
  const regex = new RegExp(`\\b(${allPatterns.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi')
  
  const parts = text.split(regex)
  return parts.map((part, i) => {
    if (i % 2 === 0) return escapeHtml(part)
    const lower = part.toLowerCase()
    const rule = rules.find(r => r.list.includes(lower))
    return `<span class="${rule ? rule.class : ""}" data-highlight="true">${escapeHtml(part)}</span>`
  }).join('')
}

function getCaretOffset(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;
  try {
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  } catch (e) {
    return 0;
  }
}

function setCaretOffset(element: HTMLElement, offset: number) {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  let currentOffset = 0;
  
  const traverse = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;
      if (currentOffset <= offset && offset <= currentOffset + textLength) {
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        return true;
      }
      currentOffset += textLength;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (traverse(node.childNodes[i])) return true;
      }
    }
    return false;
  };

  if (traverse(element)) {
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function ClarityNode({ title, value, onChange, placeholder, evaluator, suggestions = [] }: ClarityNodeProps) {
  const result = useMemo(() => evaluator?.(value), [evaluator, value])
  const editorRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!editorRef.current) return

    const highlightedHtml = highlight(value)
    if (editorRef.current.innerHTML !== highlightedHtml) {
      const offset = getCaretOffset(editorRef.current)
      editorRef.current.innerHTML = highlightedHtml
      // Restore caret only if the element is focused
      if (document.activeElement === editorRef.current) {
        setCaretOffset(editorRef.current, offset)
      }
    }
  }, [value])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // innerText handles newlines better than textContent for contenteditable
    onChange(e.currentTarget.innerText)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }

  return (
    <div className="relative w-full rounded-xl border bg-card p-4">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">{title}</h2>
        {result && (
          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", stateStyles[result.state])}>
            {result.score}%
          </span>
        )}
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          className={cn(
            "nodrag min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
            "whitespace-pre-wrap break-words outline-none transition-shadow",
            value === "" && "before:pointer-events-none before:absolute before:text-muted-foreground/50 before:content-[attr(data-placeholder)]"
          )}
          data-placeholder={placeholder}
          spellCheck={false}
        />
      </div>

      {result && <p className="mt-2 text-xs text-foreground">{result.feedback}</p>}

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange(suggestion)}
              className="nodrag rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:bg-secondary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
