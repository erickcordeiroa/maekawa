import { z } from "zod"
import { BELT_IDS } from "@/domain/belts"
import { phoneField } from "./phone"

export const PLAN_NAMES = ["Mensal", "Trimestral", "Kids"] as const
export const DUE_DAYS = ["5", "10", "15", "20"] as const
export const STRIPE_OPTIONS = ["0", "1", "2", "3", "4"] as const

export const enrollmentSchema = z
  .object({
    fullName: z.string().trim().min(3, "Digite o nome completo.").refine((v) => v.split(/\s+/).length >= 2, "Digite nome e sobrenome."),
    birthDate: z.iso.date("Informe a data de nascimento."),
    phone: phoneField(),
    address: z.string().trim().min(5, "Digite o endereço completo."),
    isMinor: z.boolean(),
    guardianName: z.string().trim().optional(),
    guardianPhone: z.string().trim().optional(),
    belt: z.enum(BELT_IDS),
    stripes: z.enum(STRIPE_OPTIONS).transform(Number),
    plan: z.enum(PLAN_NAMES, "Escolha um plano."),
    dueDay: z.enum(DUE_DAYS, "Escolha o dia de vencimento.").transform(Number),
    accepted: z.literal(true, "Você precisa aceitar o termo para enviar."),
  })
  // `when` faz a regra rodar mesmo com outros campos inválidos, para mostrar todos os erros de uma vez
  .superRefine((v, ctx) => {
    if (!v.isMinor) return
    if (!v.guardianName || v.guardianName.length < 3)
      ctx.addIssue({ code: "custom", path: ["guardianName"], message: "Digite o nome do responsável." })
    if (!v.guardianPhone || v.guardianPhone.replace(/\D/g, "").length < 10)
      ctx.addIssue({ code: "custom", path: ["guardianPhone"], message: "Digite o contato do responsável com DDD." })
  }, { when: () => true })

export type EnrollmentInput = z.infer<typeof enrollmentSchema>
export type EnrollmentFormValues = z.input<typeof enrollmentSchema>
