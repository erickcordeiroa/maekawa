"use server"

import { revalidatePath } from "next/cache"
import { graduationSchema, type GraduationInput } from "@/lib/validations/graduation"
import { enrollmentSchema, type EnrollmentFormValues } from "@/lib/validations/enrollment"
import { addStripe, promote, registerEnrollment } from "@/server/services/student.service"
import { requireSession } from "@/server/auth/session"
import { beltName } from "@/domain/belts"
import { runAction, type ActionResult } from "./result"

export async function addStripeAction(input: GraduationInput): Promise<ActionResult> {
  await requireSession()
  return runAction(graduationSchema, input, async ({ studentId, date }) => {
    const message = await addStripe(studentId, date)
    revalidatePath(`/alunos/${studentId}`)
    revalidatePath("/alunos")
    return { ok: true, message }
  })
}

export async function promoteAction(input: GraduationInput): Promise<ActionResult> {
  await requireSession()
  return runAction(graduationSchema, input, async ({ studentId, date }) => {
    const { name, belt } = await promote(studentId, date)
    revalidatePath(`/alunos/${studentId}`)
    revalidatePath("/alunos")
    return { ok: true, message: `${name} promovido à faixa ${beltName(belt)}. Oss!` }
  })
}

/** Público: ficha de matrícula enviada pelo próprio aluno */
export async function enrollAction(input: EnrollmentFormValues): Promise<ActionResult> {
  return runAction(enrollmentSchema, input, async (data) => {
    await registerEnrollment(data)
    revalidatePath("/alunos")
    return { ok: true }
  })
}
