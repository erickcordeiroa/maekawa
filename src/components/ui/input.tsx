import * as React from "react"
import { cn } from "cn"

// .f input do protótipo: 46px, borda 1.5px, foco dourado 3px
const inputClass =
  "h-[46px] w-full min-w-0 rounded-md border-[1.5px] border-edge bg-white px-3 text-base text-ink placeholder:text-ink-quiet focus:border-ink focus:outline-3 focus:outline-offset-1 focus:outline-gold disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-ink"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClass, className)}
      {...props}
    />
  )
}

export { Input, inputClass }
