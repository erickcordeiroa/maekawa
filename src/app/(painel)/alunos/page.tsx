import type { Metadata } from "next"
import Link from "next/link"
import { listStudents } from "@/server/services/student.service"
import { PageHead } from "@/components/brand/page-head"
import { Kpi, KpiGrid } from "@/components/brand/kpi"
import { IconPlus } from "@/components/brand/icons"
import { buttonVariants } from "@/components/ui/button"
import { SignupLinkBanner } from "./signup-link-banner"
import { StudentsTable } from "./students-table"

export const metadata: Metadata = { title: "Alunos" }

export default async function AlunosPage() {
  const { rows, kpis } = await listStudents()
  return (
    <>
      <PageHead title="Alunos" description="Cadastro, faixas e situação de cada aluno.">
        <Link href="/cadastro" className={buttonVariants({ variant: "dark", className: "min-h-12" })}>
          <IconPlus />
          Novo aluno
        </Link>
      </PageHead>
      <SignupLinkBanner />
      <KpiGrid>
        <Kpi label="Alunos ativos" value={kpis.active} />
        <Kpi label="Novos este mês" value={kpis.newThisMonth} />
        <Kpi label="Turma kids" value={kpis.kids} />
        <Kpi label="Mensalidade em atraso" value={kpis.late} alert valueClassName="text-red-ink">
          <Link href="/mensalidades?situacao=atrasado" className="text-[13px] font-semibold">Ver mensalidades</Link>
        </Kpi>
      </KpiGrid>
      <StudentsTable rows={rows} />
    </>
  )
}
