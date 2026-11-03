"use server"

import { revalidatePath } from "next/cache"
import { transactionSchema, type TransactionFormValues } from "@/lib/validations/finance"
import { createTransaction } from "@/server/services/finance.service"
import { requireSession } from "@/server/auth/session"
import { runAction, type ActionResult } from "./result"

export async function createTransactionAction(input: TransactionFormValues): Promise<ActionResult> {
  await requireSession()
  return runAction(transactionSchema, input, async (data) => {
    await createTransaction(data)
    revalidatePath("/financeiro")
    return { ok: true, message: "Lançamento salvo" }
  })
}
