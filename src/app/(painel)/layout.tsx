import { Suspense } from "react"
import { requireSession } from "@/server/auth/session"
import { PageSkeleton } from "@/components/brand/skeleton"
import { Logo } from "@/components/brand/logo"
import { IconOut } from "@/components/brand/icons"
import { logoutAction } from "@/server/actions/auth.actions"
import { NavList, SideNav } from "./side-nav"

/** Valida a sessão (assinatura + validade) antes de liberar o conteúdo */
async function SessionGate({ children }: { children: React.ReactNode }) {
  await requireSession()
  return children
}

// A sidebar é estática (vai no shell pré-renderizado); o conteúdo chega por streaming.
export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <aside className="flex max-w-full print:hidden flex-[1_1_240px] flex-col gap-6 border-r-4 border-gold bg-ink px-4 py-6 text-white max-[820px]:flex-[1_1_100%] max-[820px]:gap-3 max-[820px]:border-r-0 max-[820px]:border-b-4 max-[820px]:p-4">
        <div className="flex items-center gap-3 px-2">
          <Logo size={52} priority />
          <div>
            <b className="block font-display text-[17px] leading-[1.1] font-semibold uppercase">Murilo K. Maekawa</b>
            <small className="text-xs tracking-[2px] text-gold uppercase">Brazilian Jiu-Jitsu</small>
          </div>
        </div>
        <Suspense fallback={<NavList pathname={null} />}>
          <SideNav />
        </Suspense>
        <form action={logoutAction} className="mt-auto max-[820px]:mt-0">
          <button className="flex min-h-11 w-full items-center gap-3 px-3 text-sm text-[#BDBDBD]">
            <IconOut />
            Sair
          </button>
        </form>
      </aside>
      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-6 p-8 max-[820px]:px-4 max-[820px]:py-5 print:p-0">
        <Suspense fallback={<PageSkeleton />}>
          <SessionGate>{children}</SessionGate>
        </Suspense>
      </main>
    </div>
  )
}
