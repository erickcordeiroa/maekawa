import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getStudentForEdit } from "@/server/services/student.service"
import { IconBack } from "@/components/brand/icons"
import { PageHead } from "@/components/brand/page-head"
import { StudentEditForm } from "./student-edit-form"

export const metadata: Metadata = { title: "Editar aluno" }

export default async function EditarAlunoPage({ params }: PageProps<"/alunos/[id]/editar">) {
  const id = Number((await params).id)
  const data = Number.isInteger(id) ? await getStudentForEdit(id) : null
  if (!data) notFound()

  return (
    <>
      <Link href={`/alunos/${id}`} className="inline-flex min-h-11 items-center gap-1.5 self-start font-semibold no-underline">
        <IconBack />
        Voltar para {data.values.shortName}
      </Link>
      <PageHead title="Editar aluno" description="Corrija os dados enviados na matrícula, troque plano ou turma, ou desative o aluno." />
      <StudentEditForm data={data} />
    </>
  )
}
