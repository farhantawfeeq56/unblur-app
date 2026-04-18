export function ConnectorLine({ active = false }: { active?: boolean }) {
  return (
    <div className="flex items-center flex-shrink-0 w-8" aria-hidden="true">
      <div className="relative w-full h-px">
        {/* Line */}
        <div
          className="absolute inset-0 transition-colors duration-300"
          style={{
            background: active
              ? "oklch(0.556 0 0)"
              : "oklch(0.922 0 0)",
          }}
        />
        {/* Arrowhead */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 transition-all duration-300"
          style={{
            borderTop: "4px solid transparent",
            borderBottom: "4px solid transparent",
            borderLeft: active
              ? "5px solid oklch(0.556 0 0)"
              : "5px solid oklch(0.922 0 0)",
          }}
        />
      </div>
    </div>
  )
}
