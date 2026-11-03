import { cn } from "cn"
import { initials } from "@/lib/format"

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-gold", className)}>
      {initials(name)}
    </span>
  )
}
