"use server"

import { revalidatePath } from "next/cache"
import { planActiveSchema, planSchema, type PlanActiveInput, type PlanFormValues } from "@/lib/validations/plan"
import { savePlan, setPlanActive } from "@/server/services/plan.service"
import { requireSession } from "@/server/auth/session"
import { runAction, type ActionResult } from "./result"

function refresh() {
  revalidatePath("/planos")
  revalidatePath("/cadastro")
}

export async function savePlanAction(input: PlanFormValues): Promise<ActionResult> {
  await requireSession()
  return runAction(planSchema, input, async (data) => {
    const message = await savePlan(data)
    refresh()
    return { ok: true, message }
  })
}

export async function setPlanActiveAction(input: PlanActiveInput): Promise<ActionResult> {
  await requireSession()
  return runAction(planActiveSchema, input, async (data) => {
    const message = await setPlanActive(data)
    refresh()
    return { ok: true, message }
  })
}
