import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getStudentDetail } from "@/server/services/student.service"
import { Card, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/brand/avatar"
import { Belt, BeltDot } from "@/components/brand/belt"
import { IconBack } from "@/components/brand/icons"
import { PaymentBadge } from "@/components/brand/payment-badge"
import { beltName, stripesText } from "@/domain/belts"
import { todayISO } from "@/lib/dates"
import { EditButton, GraduationPanel } from "./graduation-panel"

export const metadata: Metadata = { title: "Aluno" }

export default async function AlunoPage({ params }: PageProps<"/alunos/[id]">) {
  const id = Number((await params).id)
  const s = Number.isInteger(id) ? await getStudentDetail(id) : null
  if (!s) notFound()

  const data: [string, React.ReactNode, boolean?][] = [
    ["Nome completo", s.fullName],
    ["Data de nascimento", `${s.birth} (${s.age} anos)`],
    ["Telefone", s.phone],
    ["Responsável", s.guardian ? <>{s.guardian.name}<br /><span className="font-medium">{s.guardian.phone}</span></> : "Não se aplica (adulto)"],
    ["Endereço", s.address, true],
  ]

  return (
    <>
      <Link href="/alunos" className="inline-flex min-h-11 items-center gap-1.5 self-start font-semibold no-underline">
        <IconBack />
        Voltar para alunos
      </Link>

      <Card tone="dark" className="flex flex-wrap items-center justify-between gap-6 p-7">
        <div className="flex min-w-0 items-center gap-5">
          <Avatar name={s.shortName} className="size-20 bg-gold font-display text-[30px] text-ink" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-[34px] leading-[1.1]">{s.shortName}</h1>
            <span className="text-[15px] text-on-dark">Aluno desde {s.since} · Plano {s.plan.toLowerCase()} · {s.turma}</span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2.5">
          <span className="text-[13px] tracking-[2px] text-gold uppercase">Faixa atual</span>
          <Belt belt={s.belt} stripes={s.stripes} size="lg" />
          <span className="display text-[22px]">Faixa {beltName(s.belt)} · {stripesText(s.stripes)}</span>
        </div>
      </Card>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-6">
          <Card className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <CardTitle>Dados do aluno</CardTitle>
              <EditButton />
            </div>
            <dl className="m-0 grid grid-cols-2 gap-x-5 gap-y-3.5">
              {data.map(([dt, dd, wide]) => (
                <div key={dt} className={wide ? "col-span-2" : undefined}>
                  <dt className="text-[13px] text-ink-quiet">{dt}</dt>
                  <dd className="m-0 mt-0.5 font-semibold">{dd}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <section className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col gap-1.5">
              <span className="text-sm text-ink-muted">Presenças no mês</span>
              <span className="tabular font-display text-[32px] font-semibold">{s.monthPresences}</span>
              <Link href="/frequencia" className="text-sm font-semibold">Ver frequência</Link>
            </Card>
            <Card className="flex flex-col gap-1.5">
              <span className="text-sm text-ink-muted">Mensalidade de {s.paymentMonth}</span>
              <span>{s.payment ? <PaymentBadge {...s.payment} /> : "—"}</span>
              <Link href="/mensalidades" className="text-sm font-semibold">Ver mensalidades</Link>
            </Card>
          </section>
        </div>

        <Card className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <CardTitle>Graduação</CardTitle>
          <GraduationPanel studentId={s.id} canAddStripe={s.canAddStripe} nextBelt={s.nextBelt ? beltName(s.nextBelt) : null} defaultDate={todayISO()} />
          <div>
            <h3 className="mb-2.5 text-[15px] tracking-[1px] text-ink-muted">Histórico de graduações</h3>
            <ol className="m-0 list-none p-0">
              {s.history.map((h) => (
                <li key={h.id} className="flex gap-3.5">
                  <div className="flex w-4 flex-col items-center" aria-hidden>
                    <BeltDot belt={h.belt} />
                    <span className="w-0.5 flex-1 bg-[#E0E0E0]" />
                  </div>
                  <div className="flex flex-1 flex-wrap justify-between gap-x-3 gap-y-1 pb-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">{h.label}</span>
                      <span className="text-[13px] text-ink-quiet">Prof. Murilo K. Maekawa</span>
                    </div>
                    <span className="text-sm font-semibold">{h.date}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Card>
      </div>
    </>
  )
}
