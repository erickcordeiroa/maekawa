export function HBar({ pct, color }: { pct: number; color: string }) {
  return (
    <span className="block h-3 overflow-hidden rounded-md bg-[#EDEDED]">
      <span className="block h-full rounded-md" style={{ width: `${pct}%`, background: color }} />
    </span>
  )
}
