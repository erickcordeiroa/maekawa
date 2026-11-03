"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { chargeMessage, markPaid, undoPayment } from "@/server/services/payment.service"
import { requireSession } from "@/server/auth/session"
import { runAction, type ActionResult } from "./result"

const idSchema = z.number().int().positive()

function refresh() {
  revalidatePath("/mensalidades")
  revalidatePath("/alunos", "layout")
}

export async function markPaidAction(id: number): Promise<ActionResult> {
  await requireSession()
  return runAction(idSchema, id, async (pid) => {
    const name = await markPaid(pid)
    refresh()
    return { ok: true, message: `Pagamento de ${name} registrado` }
  })
}

export async function undoPaymentAction(id: number): Promise<ActionResult> {
  await requireSession()
  return runAction(idSchema, id, async (pid) => {
    const name = await undoPayment(pid)
    refresh()
    return { ok: true, message: `Pagamento de ${name} desfeito` }
  })
}

export async function chargeAction(id: number): Promise<ActionResult<{ url: string }>> {
  await requireSession()
  return runAction(idSchema, id, async (pid) => {
    const { name, url } = await chargeMessage(pid)
    return { ok: true, message: `Mensagem de cobrança pronta para ${name}`, data: { url } }
  })
}
