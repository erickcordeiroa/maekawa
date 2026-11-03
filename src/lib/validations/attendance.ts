import { z } from "zod"

export const rollCallSchema = z.object({
  classSlug: z.string().min(1),
  marks: z.array(z.object({ studentId: z.number().int(), present: z.boolean() })).min(1, "Marque ao menos um aluno antes de salvar."),
})
export type RollCallInput = z.infer<typeof rollCallSchema>
