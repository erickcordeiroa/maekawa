"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dialog as DialogPrimitive } from "radix-ui"
import { MenuIcon, XIcon } from "lucide-react"
import { IconCalendarCheck, IconCard, IconChart, IconLink, IconQr, IconStudents, IconTag } from "@/components/brand/icons"
import { Logo } from "@/components/brand/logo"

const GROUPS = [
  {
    label: "Gestão",
    items: [
      { href: "/alunos", label: "Alunos", Icon: IconStudents },
      { href: "/mensalidades", label: "Mensalidades", Icon: IconCard },
      { href: "/frequencia", label: "Frequência", Icon: IconCalendarCheck },
      { href: "/financeiro", label: "Financeiro", Icon: IconChart },
      { href: "/planos", label: "Planos", Icon: IconTag },
    ],
  },
  {
    label: "Acesso dos alunos",
    items: [
      { href: "/cadastro", label: "Link de cadastro", Icon: IconLink },
      { href: "/checkin", label: "Check-in (aluno)", Icon: IconQr },
    ],
  },
]

const item =
  "flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-white no-underline hover:bg-[#222] aria-[current=page]:bg-gold aria-[current=page]:font-semibold aria-[current=page]:text-ink"

export function SideNav() {
  return <NavList pathname={usePathname()} />
}

/** Também usado como fallback estático do Suspense (rotas dinâmicas como /alunos/[id]) */
export function NavList({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-5">
      {GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-3 pb-1 text-[11px] font-semibold tracking-[1.5px] text-[#9A9A9A] uppercase">
            {group.label}
          </span>
          {group.items.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={item}
              aria-current={pathname?.startsWith(href) ? "page" : undefined}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}

function Brand({ size }: { size: number }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Logo size={size} />
      <div className="min-w-0">
        <b className="block truncate font-display text-[16px] leading-[1.1] font-semibold uppercase">Murilo K. Maekawa</b>
        <small className="block text-[11px] tracking-[2px] text-gold uppercase">Brazilian Jiu-Jitsu</small>
      </div>
    </div>
  )
}

export function MobileNav({ logout }: { logout: React.ReactNode }) {
  return <MobileNavPanel pathname={usePathname()} logout={logout} />
}

/** Barra superior + painel lateral (drawer) para telas até 820px */
export function MobileNavPanel({ pathname, logout }: { pathname: string | null; logout: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <header className="sticky top-0 z-40 flex flex-[1_1_100%] items-center justify-between gap-3 border-b-4 border-gold bg-ink px-4 py-3 text-white min-[821px]:hidden print:hidden">
        <Brand size={40} />
        <DialogPrimitive.Trigger
          aria-label="Abrir menu"
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-gold hover:bg-[#222]"
        >
          <MenuIcon className="size-6" />
        </DialogPrimitive.Trigger>
      </header>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-[min(320px,86vw)] flex-col gap-6 overflow-y-auto border-r-4 border-gold bg-ink px-4 py-5 text-white shadow-[0_8px_24px_rgba(0,0,0,.25)] duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
        >
          <div className="flex items-center justify-between gap-2 pl-2">
            <DialogPrimitive.Title asChild>
              <div>
                <Brand size={44} />
              </div>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Fechar menu"
              className="flex size-11 shrink-0 items-center justify-center rounded-md text-[#D6D6D6] hover:bg-[#222] hover:text-white"
            >
              <XIcon className="size-6" />
            </DialogPrimitive.Close>
          </div>

          <NavList pathname={pathname} onNavigate={() => setOpen(false)} />

          <div className="mt-auto border-t border-[#2A2A2A] pt-3">{logout}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
