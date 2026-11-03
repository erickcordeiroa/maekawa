"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { rollCallSchema, type RollCallInput } from "@/lib/validations/attendance"
import { checkinSchema, type CheckinInput } from "@/lib/validations/checkin"
import { confirmCheckin, findForCheckin, saveRollCall, type CheckinStudent } from "@/server/services/attendance.service"
import { requireSession } from "@/server/auth/session"
import { runAction, type ActionResult } from "./result"

export async function saveRollCallAction(input: RollCallInput): Promise<ActionResult> {
  await requireSession()
  return runAction(rollCallSchema, input, async (data) => {
    await saveRollCall(data)
    revalidatePath("/frequencia")
    revalidatePath("/alunos", "layout")
    return { ok: true, message: "Chamada salva!" }
  })
}

/** Público (QR code na recepção) */
export async function lookupCheckinAction(input: CheckinInput): Promise<ActionResult<CheckinStudent>> {
  return runAction(checkinSchema, input, async ({ phone }) => ({ ok: true, data: await findForCheckin(phone) }))
}

export async function confirmCheckinAction(studentId: number): Promise<ActionResult<Awaited<ReturnType<typeof confirmCheckin>>>> {
  return runAction(z.number().int().positive(), studentId, async (id) => {
    const data = await confirmCheckin(id)
    revalidatePath("/frequencia")
    return { ok: true, data }
  })
}
