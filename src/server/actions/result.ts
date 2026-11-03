import { z } from "zod"
import { DomainError } from "@/server/errors"

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

/** Valida a entrada com o mesmo schema do formulário e converte erros em resultado */
export async function runAction<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  fn: (data: z.output<S>) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Confira os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> }
  }
  try {
    return await fn(parsed.data)
  } catch (e) {
    if (e instanceof DomainError) return { ok: false, error: e.message }
    throw e
  }
}
