"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const noop = () => () => {}

export function SignupLinkBanner() {
  // origin só existe no navegador; no servidor mostramos o caminho relativo
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "")
  const url = `${origin}/cadastro`
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast("Link de cadastro copiado")
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie manualmente.")
    }
  }

  return (
    <Card tone="dark" className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="display text-sm tracking-[2px] text-gold">Link de cadastro para alunos</span>
        <span className="text-[15px]">Envie para novos alunos preencherem a matrícula sozinhos.</span>
        <code className="rounded-sm bg-[#262626] px-3 py-2 text-[15px] [overflow-wrap:anywhere]">{url.replace(/^https?:\/\//, "")}</code>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button onClick={copy}>{copied ? "Link copiado!" : "Copiar link"}</Button>
        <Link href="/cadastro" className={buttonVariants({ variant: "ghost-dark" })}>Ver formulário</Link>
      </div>
    </Card>
  )
}
