import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { connection } from "next/server"

export const SESSION_COOKIE = "mk_session"
const DAY = 86_400

function secret() {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error("SESSION_SECRET ausente ou curto (mínimo 32 caracteres).")
  return s
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url")

function encode(userId: number, maxAge: number) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + maxAge * 1000 })).toString("base64url")
  return `${payload}.${sign(payload)}`
}

function decode(token: string | undefined): { uid: number } | null {
  if (!token) return null
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString())
    return typeof data.uid === "number" && data.exp > Date.now() ? { uid: data.uid } : null
  } catch {
    return null
  }
}

export async function createSession(userId: number, remember: boolean) {
  const maxAge = remember ? 30 * DAY : DAY
  ;(await cookies()).set(SESSION_COOKIE, encode(userId, maxAge), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  })
}

export async function getSession() {
  await connection() // a validade compara com o relógio: sempre por requisição
  return decode((await cookies()).get(SESSION_COOKIE)?.value)
}

export async function deleteSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

/** Use em todo Server Action e página do painel */
export async function requireSession() {
  const s = await getSession()
  if (!s) redirect("/login")
  return s
}
