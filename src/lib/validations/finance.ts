import { z } from "zod"
import { TRANSACTION_KINDS } from "@/domain/finance"

export const transactionSchema = z.object({
  kind: z.enum(TRANSACTION_KINDS),
  description: z.string().trim().min(2, "Descreva o lançamento."),
  amount: z
    .string()
    .trim()
    .min(1, "Digite um valor.")
    // aceita "1.234,56" e "1234.56"
    .transform((v) => Number(v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v))
    .pipe(z.number("Digite um valor válido.").positive("O valor deve ser maior que zero.").max(1_000_000, "Valor muito alto.")),
})
export type TransactionInput = z.infer<typeof transactionSchema>
export type TransactionFormValues = z.input<typeof transactionSchema>
