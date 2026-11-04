import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getStudentDetail } from "@/server/services/student.service"
import { Card } from "@/components/ui/card"
import { IconBack } from "@/components/brand/icons"
import { TermDocument } from "@/components/brand/term-document"
import { SIGNER_LABEL } from "@/domain/term"
import { PrintButton } from "../graduation-panel"

export const metadata: Metadata = { title: "Termo de responsabilidade" }

export default async function TermoPage({ params }: PageProps<"/alunos/[id]/termo">) {
  const id = Number((await params).id)
  const s = Number.isInteger(id) ? await getStudentDetail(id) : null
  if (!s?.term) notFound()

  const identification: [string, string][] = [
    ["Nome completo", s.fullName],
    ["Data de nascimento", s.birth],
    ["CPF", s.cpf ?? "Não informado"],
    ["Telefone", s.phone],
    ["Endereço", s.address],
    ...(s.guardian ? ([["Responsável", s.guardian.name], ["CPF do responsável", s.guardian.cpf ?? "Não informado"]] as [string, string][]) : []),
  ]

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/alunos/${s.id}`} className="inline-flex min-h-11 items-center gap-1.5 font-semibold no-underline">
          <IconBack />
          Voltar para {s.shortName}
        </Link>
        <PrintButton />
      </div>

      <Card className="flex max-w-[820px] flex-col gap-6 print:border-0 print:p-0">
        <TermDocument identification={identification} isMinor={!!s.guardian} />
        <section className="flex flex-col gap-2 rounded-lg bg-panel p-[18px] text-sm">
          <h4 className="text-[15px] tracking-[1px]">Registro do aceite eletrônico</h4>
          <p className="m-0">
            Aceito por <b>{s.term.signerName}</b> ({SIGNER_LABEL[s.term.signerRole].toLowerCase()}, CPF {s.term.signerCpf}) em {s.term.acceptedAt}
            {s.term.ip ? `, a partir do IP ${s.term.ip}` : ""}. Versão do termo: {s.term.version}.
          </p>
          <p className="m-0">
            Representante da academia: {s.approval ? `${s.approval.by}, matrícula confirmada em ${s.approval.at}.` : "matrícula ainda não confirmada."}
          </p>
        </section>
      </Card>
    </>
  )
}
