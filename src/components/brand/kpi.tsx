import { cn } from "cn"
import { Card } from "@/components/ui/card"

export function KpiGrid({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4", className)} {...props} />
}

export function Kpi({
  label, value, sub, tone = "light", alert, valueClassName, children,
}: {
  label: string; value?: React.ReactNode; sub?: React.ReactNode; tone?: "light" | "dark"; alert?: boolean; valueClassName?: string; children?: React.ReactNode
}) {
  const dark = tone === "dark"
  return (
    <Card tone={tone} alert={alert} className="flex flex-col gap-1.5">
      <span className={cn("text-sm", dark ? "text-on-dark" : "text-ink-muted")}>{label}</span>
      {value !== undefined && <span className={cn("tabular font-display text-[32px] font-semibold", dark && "text-gold", valueClassName)}>{value}</span>}
      {sub && <span className={cn("text-[13px]", dark ? "text-on-dark" : "text-ink-muted")}>{sub}</span>}
      {children}
    </Card>
  )
}
