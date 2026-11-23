import { z } from "zod"
import { BELT_IDS, maxStripes } from "@/domain/belts"

export const graduationSchema = z.object({
  studentId: z.number().int().positive(),
  date: z.iso.date("Escolha a data da graduação."),
})
export type GraduationInput = z.infer<typeof graduationSchema>

/** Correção da faixa/graus pelo administrador (desfazer grau ou promoção lançados por engano) */
export const beltCorrectionSchema = z
  .object({
    studentId: z.number().int().positive(),
    belt: z.enum(BELT_IDS, "Escolha a faixa."),
    stripes: z.string().regex(/^\d$/, "Escolha os graus.").transform(Number),
  })
  .refine((v) => v.stripes <= maxStripes(v.belt), { path: ["stripes"], message: "Essa faixa não tem tantos graus." })
export type BeltCorrectionInput = z.infer<typeof beltCorrectionSchema>
export type BeltCorrectionFormValues = z.input<typeof beltCorrectionSchema>

/**
 * Histórico lançado do caderno: uma data por passo do caminho até a faixa atual.
 * Data vazia = passo sem anotação (fica fora do histórico). A ordem, o futuro e o
 * nascimento são conferidos por `historyDateErrors` (domínio), na tela e no servidor.
 */
export const historySchema = z
  .object({
    studentId: z.number().int().positive(),
    startBelt: z.enum(BELT_IDS, "Escolha a faixa em que o aluno começou."),
    steps: z.array(z.object({ date: z.union([z.literal(""), z.iso.date("Data inválida. Use dia, mês e ano com 4 dígitos.")]) })).max(60),
  })
  .refine((v) => v.steps.some((s) => s.date), { path: ["steps"], message: "Preencha a data de pelo menos um passo." })
export type HistoryInput = z.infer<typeof historySchema>

/** Ajuste da data de um lançamento do histórico */
export const graduationDateSchema = z.object({
  graduationId: z.number().int().positive(),
  date: z.iso.date("Escolha uma data válida."),
})
export type GraduationDateInput = z.infer<typeof graduationDateSchema>
