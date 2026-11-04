import { z } from "zod"

export const planSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Digite o nome do plano.").max(60, "Use até 60 caracteres."),
  description: z.string().trim().min(2, "Descreva o plano em poucas palavras.").max(120, "Use até 120 caracteres."),
  price: z
    .string()
    .trim()
    .min(1, "Digite o valor mensal.")
    // aceita "1.234,56" e "1234.56"
    .transform((v) => Number(v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v))
    .pipe(z.number("Digite um valor válido.").positive("O valor deve ser maior que zero.").max(100_000, "Valor muito alto.")),
  isKids: z.boolean(),
})
export type PlanInput = z.infer<typeof planSchema>
export type PlanFormValues = z.input<typeof planSchema>

export const planActiveSchema = z.object({ id: z.number().int().positive(), active: z.boolean() })
export type PlanActiveInput = z.infer<typeof planActiveSchema>
