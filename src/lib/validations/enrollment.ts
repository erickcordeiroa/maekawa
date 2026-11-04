import { z } from "zod"
import { BELT_IDS } from "@/domain/belts"
import { isValidCpf } from "@/domain/cpf"
import { ageOn, dateOnly, todayISO } from "@/lib/dates"
import { phoneField } from "./phone"

export const PLAN_NAMES = ["Mensal", "Trimestral", "Kids"] as const
export const DUE_DAYS = ["5", "10", "15", "20"] as const
export const STRIPE_OPTIONS = ["0", "1", "2", "3", "4"] as const

/** Idade < 18 pela data de nascimento (usada para conferir a resposta "é menor?") */
export function isMinorOn(birthISO: string, todayIso = todayISO()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthISO) || birthISO > todayIso) return false
  return ageOn(dateOnly(birthISO), dateOnly(todayIso)) < 18
}

const digits = (v?: string) => (v ?? "").replace(/\D/g, "")

export const enrollmentSchema = z
  .object({
    fullName: z.string().trim().min(3, "Digite o nome completo.").refine((v) => v.split(/\s+/).length >= 2, "Digite nome e sobrenome."),
    birthDate: z.iso.date("Informe a data de nascimento.").refine((v) => v <= todayISO(), "A data de nascimento não pode ser no futuro."),
    phone: phoneField(),
    cpf: z.string().trim().optional(),
    address: z.string().trim().min(5, "Digite o endereço completo."),
    isMinor: z.boolean(),
    guardianName: z.string().trim().optional(),
    guardianPhone: z.string().trim().optional(),
    guardianCpf: z.string().trim().optional(),
    belt: z.enum(BELT_IDS),
    stripes: z.enum(STRIPE_OPTIONS).transform(Number),
    plan: z.enum(PLAN_NAMES, "Escolha um plano."),
    dueDay: z.enum(DUE_DAYS, "Escolha o dia de vencimento.").transform(Number),
    accepted: z.literal(true, "Você precisa aceitar o termo para enviar."),
  })
  // `when` faz a regra rodar mesmo com outros campos inválidos, para mostrar todos os erros de uma vez
  .superRefine((v, ctx) => {
    const minor = v.isMinor
    // A resposta precisa bater com a data de nascimento
    if (/^\d{4}-\d{2}-\d{2}$/.test(v.birthDate) && v.birthDate <= todayISO() && isMinorOn(v.birthDate) !== minor)
      ctx.addIssue({
        code: "custom",
        path: ["isMinor"],
        message: minor ? "Pela data de nascimento, o aluno já tem 18 anos ou mais." : "Pela data de nascimento, o aluno é menor de 18 anos.",
      })
    const cpf = digits(v.cpf)
    // Adulto: CPF obrigatório. Menor: CPF do aluno é opcional, mas se vier precisa ser válido.
    if (!minor && !cpf) ctx.addIssue({ code: "custom", path: ["cpf"], message: "Digite o CPF." })
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
  }, { when: () => true })
  .transform((v) => {
    const isMinor = v.isMinor
    return {
      ...v,
      isMinor,
      cpf: digits(v.cpf) || null,
      guardianName: isMinor ? v.guardianName ?? null : null,
      guardianPhone: isMinor ? digits(v.guardianPhone) : null,
      guardianCpf: isMinor ? digits(v.guardianCpf) : null,
    }
  })

export type EnrollmentInput = z.infer<typeof enrollmentSchema>
export type EnrollmentFormValues = z.input<typeof enrollmentSchema>
