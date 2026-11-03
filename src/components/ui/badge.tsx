import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// .badge .b-paid / .b-pend / .b-late do protótipo
const badgeVariants = cva(
  "inline-block w-fit rounded-sm px-2.5 py-1.5 text-[13px] font-bold whitespace-nowrap",
  {
    variants: {
      variant: {
        paid: "bg-ink text-white",
        pending: "bg-pending text-pending-ink",
        late: "bg-red-soft text-red-ink",
        neutral: "bg-[#EDEDED] text-ink",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
