import { brl } from "@/lib/format"

/** Linha de lucro em SVG (mesma geometria do protótipo: 600×220, base em y=200) */
export function ProfitChart({ months }: { months: { label: string; profit: number }[] }) {
  const top = Math.max(8_000_00, ...months.map((m) => m.profit))
  const step = months.length > 1 ? 560 / (months.length - 1) : 0
  const pts = months.map((m, i) => [Math.round(20 + i * step), Math.round(200 - (Math.max(0, m.profit) / top) * 180)] as const)
  const line = pts.map((p) => p.join(",")).join(" ")
  const area = `${pts[0][0]},200 ${line} ${pts.at(-1)![0]},200`
  const first = months[0], last = months.at(-1)!

  return (
    <>
      <svg viewBox="0 0 600 220" className="h-auto w-full" role="img" aria-label={`Lucro: ${months.map((m) => `${m.label} ${brl(m.profit)}`).join(", ")}`}>
        <line x1="0" y1="200" x2="600" y2="200" stroke="#0E0E0E" strokeWidth="2" />
        <line x1="0" y1="110" x2="600" y2="110" stroke="#E6E6E6" />
        <line x1="0" y1="20" x2="600" y2="20" stroke="#E6E6E6" />
        <polygon points={area} fill="#F3C519" fillOpacity="0.28" />
        <polyline points={line} fill="none" stroke="#0E0E0E" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <circle key={months[i].label} cx={x} cy={y} r="5" fill="#F3C519" stroke="#0E0E0E" strokeWidth="2">
            <title>{`${months[i].label}: ${brl(months[i].profit)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[13px] text-ink-muted">
        <span>{first.label}: {brl(first.profit)}</span>
        <span>{last.label}: {brl(last.profit)}</span>
      </div>
    </>
  )
}
