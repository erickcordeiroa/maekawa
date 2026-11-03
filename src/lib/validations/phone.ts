import { z } from "zod"

export const phoneField = (required = "Digite o telefone com DDD.") =>
  z
    .string()
    .trim()
    .min(1, required)
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Digite o telefone com DDD.")
