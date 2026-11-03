"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

// Toast do protótipo: pílula preta, ponto dourado, centralizado embaixo
const Dot = () => <i className="inline-block size-2.5 rounded-full bg-gold" />

const Toaster = (props: ToasterProps) => (
  <Sonner
    position="bottom-center"
    duration={2400}
    icons={{ success: <Dot />, info: <Dot />, warning: <Dot />, error: <i className="inline-block size-2.5 rounded-full bg-red" /> }}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast:
          "flex items-center gap-2.5 rounded-[10px] bg-ink px-5 py-3.5 font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,.25)]",
      },
    }}
    {...props}
  />
)

export { Toaster }
