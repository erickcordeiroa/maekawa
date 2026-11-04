import { z } from "zod"
import { checkPerson, DUE_DAYS, normalizePerson, personShape } from "./enrollment"

export const STUDENT_STATUSES = ["ativo", "pendente", "inativo"] as const
export const STUDENT_STATUS_LABEL: Record<(typeof STUDENT_STATUSES)[number], string> = {
  ativo: "Ativo",
  pendente: "Matrícula a confirmar",
  inativo: "Inativo (desativado)",
}

/** Edição completa dos dados do aluno pelo administrador (faixa e graus seguem pelo painel de graduação) */
export const studentEditSchema = z
  .object({
    id: z.number().int().positive(),
    ...personShape,
    shortName: z.string().trim().min(2, "Digite como o aluno é chamado.").max(40, "Use até 40 caracteres."),
    planId: z.string().regex(/^\d+$/, "Escolha um plano.").transform(Number),
    // "" = sem turma
    classGroupId: z.string().regex(/^\d*$/).transform((v) => (v ? Number(v) : null)),
    dueDay: z.enum(DUE_DAYS, "Escolha o dia de vencimento.").transform(Number),
    status: z.enum(STUDENT_STATUSES),
  })
  .superRefine((v, ctx) => checkPerson(v, ctx, { requireAdultCpf: false }), { when: () => true })
  .transform(normalizePerson)

export type StudentEditInput = z.infer<typeof studentEditSchema>
export type StudentEditFormValues = z.input<typeof studentEditSchema>
