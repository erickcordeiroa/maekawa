import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Variantes espelham o protótipo: .btn-gold, .btn-dark, .btn-outline, .btn-ghost, .btn-red
const buttonCva = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border-[1.5px] text-[15px] font-bold whitespace-nowrap no-underline transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:bg-line disabled:text-ink-quiet [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        gold: "border-transparent bg-gold text-ink hover:bg-gold-hover",
        dark: "border-transparent bg-ink font-display font-semibold tracking-[1px] text-gold uppercase",
        outline: "border-ink bg-white text-ink",
        ghost: "border-edge bg-white font-semibold text-[#333]",
        red: "border-transparent bg-red text-white",
        "ghost-dark": "border-white bg-transparent font-semibold text-white",
        plain: "border-transparent bg-transparent",
      },
      size: {
        default: "min-h-11 px-[18px]",
        sm: "min-h-11 px-[18px] text-sm",
        lg: "min-h-[54px] w-full px-[18px] font-display text-lg font-semibold tracking-[2px] uppercase",
        icon: "min-h-11 px-3",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "default",
    },
  }
)

/** Igual ao cva, mas resolve conflitos de classe (ex.: className sobrescrevendo bg/min-h) */
const buttonVariants = (props?: Parameters<typeof buttonCva>[0]) => cn(buttonCva(props))

function Button({
  className,
  variant = "gold",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonCva> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
