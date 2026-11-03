import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
  remember: z.boolean(),
})
export type LoginInput = z.infer<typeof loginSchema>

export const recoverSchema = z.object({
  email: z.email("Digite um e-mail válido."),
})
export type RecoverInput = z.infer<typeof recoverSchema>
