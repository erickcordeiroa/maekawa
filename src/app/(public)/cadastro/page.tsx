import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { listPlans } from "@/server/services/student.service"
import { getSession } from "@/server/auth/session"
import { Logo } from "@/components/brand/logo"
import { IconBack } from "@/components/brand/icons"
import { buttonVariants } from "@/components/ui/button"
import { EnrollmentForm } from "./enrollment-form"

export const metadata: Metadata = { title: "Ficha de matrícula" }

async function PanelLink() {
  if (!(await getSession())) return null
  return (
    <Link href="/alunos" className={buttonVariants({ variant: "ghost", className: "ml-auto border-[#555] bg-transparent text-white" })}>
      <IconBack />
      Painel
    </Link>
  )
}

async function Form() {
  const plans = await listPlans()
  return <EnrollmentForm plans={plans.map((p) => ({ id: p.id, name: p.name, description: p.description, priceCents: p.priceCents }))} />
}

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b-[6px] border-gold bg-ink px-5 py-6">
        <div className="mx-auto flex max-w-[820px] flex-wrap items-center gap-5">
          <Logo size={84} alt="Logo" priority />
          <div>
            <p className="display text-sm tracking-[3px] text-gold">Ficha de matrícula</p>
            <h1 className="text-[32px] leading-[1.1] text-white">Seja aluno Murilo K. Maekawa BJJ</h1>
          </div>
          <Suspense>
            <PanelLink />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-[820px] px-5 pt-7 pb-16">
        <Suspense fallback={<div className="h-[600px] animate-pulse rounded-xl bg-white" />}>
          <Form />
        </Suspense>
      </main>
    </div>
  )
}
