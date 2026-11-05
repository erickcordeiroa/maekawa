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
