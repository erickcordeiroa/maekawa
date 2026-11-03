import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// .card / .card-dark / .alert-border do protótipo
const cardVariants = cva("rounded-xl p-[22px]", {
  variants: {
    tone: {
      light: "bg-white text-ink",
      dark: "bg-ink text-white",
    },
    alert: {
      true: "border-2 border-red",
      false: "",
    },
  },
  defaultVariants: { tone: "light", alert: false },
})

function Card({
  className,
  tone,
  alert,
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof cardVariants>) {
  return (
    <section
      data-slot="card"
      data-tone={tone ?? "light"}
      className={cn(cardVariants({ tone, alert }), className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("text-xl", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("mt-1 text-sm text-ink-muted", className)}
      {...props}
    />
  )
}

export { Card, CardTitle, CardDescription, cardVariants }
