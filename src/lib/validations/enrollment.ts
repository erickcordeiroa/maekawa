import { z } from "zod"
import { BELT_IDS } from "@/domain/belts"
import { isValidCpf } from "@/domain/cpf"
import { ageOn, dateOnly, todayISO } from "@/lib/dates"
import { phoneField } from "./phone"

export const DUE_DAYS = ["5", "10", "15", "20"] as const
export const STRIPE_OPTIONS = ["0", "1", "2", "3", "4"] as const

/** Idade < 18 pela data de nascimento (usada para conferir a resposta "é menor?") */
export function isMinorOn(birthISO: string, todayIso = todayISO()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthISO) || birthISO > todayIso) return false
  return ageOn(dateOnly(birthISO), dateOnly(todayIso)) < 18
}

const digits = (v?: string) => (v ?? "").replace(/\D/g, "")

/** Dados pessoais do aluno: iguais na matrícula pública e na edição pelo painel */
export const personShape = {
  fullName: z.string().trim().min(3, "Digite o nome completo.").refine((v) => v.split(/\s+/).length >= 2, "Digite nome e sobrenome."),
  birthDate: z.iso.date("Informe a data de nascimento.").refine((v) => v <= todayISO(), "A data de nascimento não pode ser no futuro."),
  phone: phoneField(),
  cpf: z.string().trim().optional(),
  address: z.string().trim().min(5, "Digite o endereço completo."),
  isMinor: z.boolean(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  guardianCpf: z.string().trim().optional(),
}

type PersonValues = z.output<z.ZodObject<typeof personShape>>

/**
 * Regras cruzadas dos dados pessoais.
 * `requireAdultCpf`: na matrícula o CPF do adulto é obrigatório; no painel é opcional
 * para não travar a edição de alunos antigos que ainda não têm CPF.
 */
export function checkPerson(v: PersonValues, ctx: z.RefinementCtx, { requireAdultCpf }: { requireAdultCpf: boolean }) {
  const minor = v.isMinor
  // A resposta "é menor?" precisa bater com a data de nascimento
  if (/^\d{4}-\d{2}-\d{2}$/.test(v.birthDate) && v.birthDate <= todayISO() && isMinorOn(v.birthDate) !== minor)
    ctx.addIssue({
      code: "custom",
      path: ["isMinor"],
      message: minor ? "Pela data de nascimento, o aluno já tem 18 anos ou mais." : "Pela data de nascimento, o aluno é menor de 18 anos.",
    })
  const cpf = digits(v.cpf)
  if (!minor && !cpf && requireAdultCpf) ctx.addIssue({ code: "custom", path: ["cpf"], message: "Digite o CPF." })
  else if (cpf && !isValidCpf(cpf)) ctx.addIssue({ code: "custom", path: ["cpf"], message: "CPF inválido. Confira os números." })
  if (!minor) return
  const gCpf = digits(v.guardianCpf)
  if (!gCpf) ctx.addIssue({ code: "custom", path: ["guardianCpf"], message: "Digite o CPF do responsável." })
  else if (!isValidCpf(gCpf)) ctx.addIssue({ code: "custom", path: ["guardianCpf"], message: "CPF do responsável inválido. Confira os números." })
  else if (gCpf === cpf) ctx.addIssue({ code: "custom", path: ["guardianCpf"], message: "O CPF do responsável deve ser diferente do CPF do aluno." })
  if (!v.guardianName || v.guardianName.length < 3)
    ctx.addIssue({ code: "custom", path: ["guardianName"], message: "Digite o nome do responsável." })
  if (!v.guardianPhone || v.guardianPhone.replace(/\D/g, "").length < 10)
    ctx.addIssue({ code: "custom", path: ["guardianPhone"], message: "Digite o contato do responsável com DDD." })
}

/** Normaliza para gravar: só dígitos, e dados do responsável apenas para menores */
export function normalizePerson<T extends PersonValues>(v: T) {
  const isMinor = v.isMinor
  return {
    ...v,
    cpf: digits(v.cpf) || null,
    guardianName: isMinor ? v.guardianName ?? null : null,
    guardianPhone: isMinor ? digits(v.guardianPhone) : null,
    guardianCpf: isMinor ? digits(v.guardianCpf) : null,
  }
}

export const enrollmentSchema = z
  .object({
    ...personShape,
    belt: z.enum(BELT_IDS),
    stripes: z.enum(STRIPE_OPTIONS).transform(Number),
    planId: z.string().regex(/^\d+$/, "Escolha um plano.").transform(Number),
    dueDay: z.enum(DUE_DAYS, "Escolha o dia de vencimento.").transform(Number),
    accepted: z.literal(true, "Você precisa aceitar o termo para enviar."),
  })
  // `when` faz a regra rodar mesmo com outros campos inválidos, para mostrar todos os erros de uma vez
  .superRefine((v, ctx) => checkPerson(v, ctx, { requireAdultCpf: true }), { when: () => true })
  .transform(normalizePerson)

export type EnrollmentInput = z.infer<typeof enrollmentSchema>
export type EnrollmentFormValues = z.input<typeof enrollmentSchema>
