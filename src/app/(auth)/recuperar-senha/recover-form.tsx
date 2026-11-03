"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { IconMail } from "@/components/brand/icons"
import { recoverSchema, type RecoverInput } from "@/lib/validations/auth"
import { recoverAction } from "@/server/actions/auth.actions"

export function RecoverForm() {
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()
  const form = useForm<RecoverInput>({ resolver: zodResolver(recoverSchema), defaultValues: { email: "" } })

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3.5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-ink text-gold">
          <IconMail />
        </div>
        <h1 className="text-[28px]">Verifique seu e-mail</h1>
        <p className="leading-normal text-ink-muted">Se o e-mail estiver cadastrado, você receberá em instantes um link válido por 60 minutos.</p>
        <Button variant="outline" onClick={() => { form.reset(); setSent(false) }}>Reenviar e-mail</Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-[18px]"
      onSubmit={form.handleSubmit((v) => startTransition(async () => { const r = await recoverAction(v); if (r.ok) setSent(true) }))}
    >
      <div className="text-center">
        <h1 className="text-[30px]">Recuperar senha</h1>
        <p className="mt-2 leading-normal text-ink-muted">Informe o e-mail cadastrado. Enviaremos um link para você criar uma nova senha.</p>
      </div>
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="rec-email">E-mail</FieldLabel>
            <Input {...field} id="rec-email" type="email" placeholder="seuemail@exemplo.com" aria-invalid={fieldState.invalid} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Enviando…" : "Enviar link"}</Button>
    </form>
  )
}
