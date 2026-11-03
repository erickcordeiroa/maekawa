import { cn } from "cn"
import { BELTS, stripesText, type BeltId } from "@/domain/belts"

/** Faixa com ponteira e um traço branco por grau (componente-assinatura) */
export function Belt({ belt, stripes, size = "sm" }: { belt: BeltId; stripes: number; size?: "sm" | "lg" }) {
  const b = BELTS[belt]
  const lg = size === "lg"
  return (
    <span
      role="img"
      aria-label={`Faixa ${b.name}, ${stripesText(stripes)}`}
      style={{ background: b.color }}
      className={cn(
        "inline-flex shrink-0 justify-end overflow-hidden rounded-[3px] border",
        lg ? "h-[34px] w-[240px] border-2 border-[#5A5A5A]" : "h-4 w-24 border-[#9A9A9A]"
      )}
    >
      <span style={{ background: b.bar }} className={cn("inline-flex h-full justify-center", lg ? "w-20 gap-1.5 px-1.5" : "w-[34px] gap-[3px] px-[3px]")}>
        {Array.from({ length: stripes }, (_, i) => (
          <i key={i} className={cn("h-full bg-white", lg ? "w-1.5" : "w-[3px]")} />
        ))}
      </span>
    </span>
  )
}

export function BeltDot({ belt }: { belt: BeltId }) {
  return <span aria-hidden className="size-4 rounded-full border-2 border-ink" style={{ background: BELTS[belt].color }} />
}
