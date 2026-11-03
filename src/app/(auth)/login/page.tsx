import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/server/auth/session"
import { Logo } from "@/components/brand/logo"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Entrar" }

/** Quem já tem sessão válida vai direto para o painel */
async function RedirectIfSignedIn(): Promise<null> {
  if (await getSession()) redirect("/alunos")
  return null
}

export default function LoginPage() {
  const demo = process.env.NODE_ENV === "development"

  return (
    <div className="flex min-h-screen flex-wrap bg-white">
      <section className="flex min-w-0 flex-[1_1_520px] flex-col justify-between gap-10 border-r-[6px] border-gold bg-ink px-14 py-12 text-white max-[820px]:border-r-0 max-[820px]:border-b-[6px] max-[820px]:px-6 max-[820px]:py-8">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-7 bg-gold" />
          <span className="display text-sm tracking-[3px] text-gold">Portal da academia</span>
        </div>
        <div className="flex flex-col items-center gap-7 text-center">
          <Logo size={280} priority alt="Logo Murilo K. Maekawa Brazilian Jiu-Jitsu" className="h-auto w-[280px] max-w-[70%] max-[820px]:w-40" />
          <div>
            <h1 className="text-[44px] leading-[1.05] font-bold">Murilo K. Maekawa</h1>
            <p className="display mt-2 text-xl tracking-[6px] text-gold">Brazilian Jiu-Jitsu</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 flex-1 bg-white" />
          <span className="h-2.5 w-16 bg-red" />
          <span className="h-2.5 w-1.5 bg-white" />
          <span className="h-2.5 w-1.5 bg-white" />
          <span className="h-2.5 w-1.5 bg-white" />
          <span className="h-2.5 w-10 border border-[#555]" />
        </div>
      </section>
      <section className="flex min-w-0 flex-[1_1_440px] items-center justify-center px-6 py-12">
        <Suspense>
          <RedirectIfSignedIn />
        </Suspense>
        <LoginForm defaults={demo ? { email: "murilo@academia.com.br", password: "oss12345" } : undefined} />
      </section>
    </div>
  )
}
