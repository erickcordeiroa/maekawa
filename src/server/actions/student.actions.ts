"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { graduationSchema, type GraduationInput } from "@/lib/validations/graduation"
import { enrollmentSchema, type EnrollmentFormValues } from "@/lib/validations/enrollment"
import { addStripe, confirmEnrollment, promote, registerEnrollment } from "@/server/services/student.service"
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
    // IP e navegador ficam no registro do aceite do termo, como prova da manifestação
    const h = await headers()
    const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip")
    await registerEnrollment(data, { ip: ip ?? null, userAgent: h.get("user-agent") })
    revalidatePath("/alunos")
    return { ok: true }
  })
}

const studentIdSchema = z.object({ studentId: z.number().int().positive() })

export async function confirmEnrollmentAction(input: { studentId: number }): Promise<ActionResult> {
  const session = await requireSession()
  return runAction(studentIdSchema, input, async ({ studentId }) => {
    const message = await confirmEnrollment(studentId, session.uid)
    revalidatePath(`/alunos/${studentId}`)
    revalidatePath("/alunos")
    return { ok: true, message }
  })
}
