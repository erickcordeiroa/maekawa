import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { IconBack } from "@/components/brand/icons"
import { RecoverForm } from "./recover-form"

export const metadata: Metadata = { title: "Recuperar senha" }

export default function RecoverPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-12">
      <div className="flex w-full max-w-[460px] flex-col gap-[22px] rounded-2xl border-t-8 border-gold bg-white px-9 py-10 max-[480px]:px-6">
        <div className="flex justify-center">
          <Logo size={96} alt="Logo" priority />
        </div>
        <RecoverForm />
        <Link href="/login" className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold no-underline">
          <IconBack />
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
