"use client"

import { cn } from "cn"

/** Chip de filtro/alternância (aria-pressed), igual ao .chip do protótipo */
export function Chip({ pressed, className, ...props }: React.ComponentProps<"button"> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "min-h-10 rounded-full border-[1.5px] border-edge bg-white px-3.5 text-sm font-semibold text-ink",
        "aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-gold",
        className
      )}
      {...props}
    />
  )
}

export function ChipGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" className={cn("flex flex-wrap gap-2", className)} {...props} />
}
