"use server"

import { redirect } from "next/navigation"
import { loginSchema, recoverSchema, type LoginInput, type RecoverInput } from "@/lib/validations/auth"
import { authenticate } from "@/server/services/auth.service"
import { createSession, deleteSession } from "@/server/auth/session"
import { runAction, type ActionResult } from "./result"

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const result = await runAction(loginSchema, input, async ({ email, password, remember }) => {
    const user = await authenticate(email, password)
    if (!user) return { ok: false, error: "E-mail ou senha incorretos." }
    await createSession(user.id, remember)
    return { ok: true }
  })
  if (result.ok) redirect("/alunos")
  return result
}

export async function recoverAction(input: RecoverInput): Promise<ActionResult> {
  // Sem envio de e-mail ainda: a resposta é a mesma exista ou não a conta.
  return runAction(recoverSchema, input, async () => ({ ok: true }))
}

export async function logoutAction() {
  await deleteSession()
  redirect("/login")
}
