"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconCalendarCheck, IconCard, IconChart, IconLink, IconQr, IconStudents, IconTag } from "@/components/brand/icons"

const NAV = [
  { href: "/alunos", label: "Alunos", Icon: IconStudents },
  { href: "/mensalidades", label: "Mensalidades", Icon: IconCard },
  { href: "/frequencia", label: "Frequência", Icon: IconCalendarCheck },
  { href: "/financeiro", label: "Financeiro", Icon: IconChart },
  { href: "/planos", label: "Planos", Icon: IconTag },
  { href: "/cadastro", label: "Link de cadastro", Icon: IconLink },
  { href: "/checkin", label: "Check-in (aluno)", Icon: IconQr },
]

const item =
  "flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-white no-underline hover:bg-[#222] aria-[current=page]:bg-gold aria-[current=page]:font-semibold aria-[current=page]:text-ink max-[820px]:flex-[1_1_140px]"

export function SideNav() {
  return <NavList pathname={usePathname()} />
}

/** Também usado como fallback estático do Suspense (rotas dinâmicas como /alunos/[id]) */
export function NavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-1 max-[820px]:flex-row max-[820px]:flex-wrap">
      {NAV.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={item} aria-current={pathname?.startsWith(href) ? "page" : undefined}>
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  )
}
