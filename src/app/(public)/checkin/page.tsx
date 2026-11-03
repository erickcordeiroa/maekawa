import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { checkinDateLabel } from "@/server/services/attendance.service"
import { Logo } from "@/components/brand/logo"
import { IconBack } from "@/components/brand/icons"
import { CheckinFlow } from "./checkin-flow"

export const metadata: Metadata = { title: "Check-in do treino" }

async function TodayLabel() {
  return <>{await checkinDateLabel()}</>
}

export default function CheckinPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#2a2a2a] px-4 py-8 max-[480px]:p-0">
      <div className="flex min-h-[780px] w-[390px] max-w-full flex-col overflow-hidden rounded-[36px] border-8 border-[#1d1d1d] bg-ink shadow-[0_20px_50px_rgba(0,0,0,.35)] max-[480px]:min-h-screen max-[480px]:rounded-none max-[480px]:border-0 max-[480px]:shadow-none">
        <header className="flex flex-col items-center gap-2.5 border-b-[6px] border-gold px-6 pt-8 pb-[26px]">
          <Logo size={100} alt="Logo" priority />
          <p className="display text-[15px] tracking-[4px] text-gold">Check-in do treino</p>
          <p className="min-h-5 text-sm text-on-dark"><Suspense><TodayLabel /></Suspense></p>
        </header>
        <main className="flex-1 bg-white px-6 py-7">
          <CheckinFlow demoHint={process.env.NODE_ENV === "development"} />
        </main>
      </div>
      <Link href="/frequencia" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-white max-[480px]:hidden">
        <IconBack />
        Voltar ao painel (Frequência)
      </Link>
    </div>
  )
}
