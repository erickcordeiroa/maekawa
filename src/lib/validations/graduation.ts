import { z } from "zod"

export const graduationSchema = z.object({
  studentId: z.number().int().positive(),
  date: z.iso.date("Escolha a data da graduação."),
})
export type GraduationInput = z.infer<typeof graduationSchema>
