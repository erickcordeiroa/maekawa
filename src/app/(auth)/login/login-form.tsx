"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { IconEye } from "@/components/brand/icons"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { loginAction } from "@/server/actions/auth.actions"

export function LoginForm({ defaults }: { defaults?: { email: string; password: string } }) {
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaults?.email ?? "", password: defaults?.password ?? "", remember: true },
  })

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      setServerError(null)
      const res = await loginAction(values)
      if (res && !res.ok) setServerError(res.error)
    })
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full max-w-[420px] flex-col gap-[22px]">
      <div>
        <h2 className="text-4xl">Entrar</h2>
        <p className="mt-2 text-ink-muted">Acesse o painel para gerenciar alunos, mensalidades e frequência.</p>
      </div>

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input {...field} id="email" type="email" autoComplete="username" aria-invalid={fieldState.invalid} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex items-baseline justify-between">
              <FieldLabel htmlFor="pw">Senha</FieldLabel>
              <Link href="/recuperar-senha" className="text-sm font-semibold">Esqueci minha senha</Link>
            </div>
            <div className="flex overflow-hidden rounded-md border-[1.5px] border-edge has-[input:focus]:border-ink has-[input:focus]:outline-3 has-[input:focus]:outline-offset-1 has-[input:focus]:outline-gold has-aria-invalid:border-red-ink">
              <Input {...field} id="pw" type={showPass ? "text" : "password"} autoComplete="current-password" aria-invalid={fieldState.invalid} className="rounded-none border-0 focus:outline-none" />
              <button type="button" onClick={() => setShowPass((s) => !s)} aria-label="Mostrar ou ocultar senha" aria-pressed={showPass} className="flex w-[52px] items-center justify-center bg-[#F4F4F4]">
                <IconEye />
              </button>
            </div>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="remember"
        control={form.control}
        render={({ field }) => (
          <Field orientation="horizontal" className="gap-2.5">
            <Checkbox id="remember" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
            <FieldLabel htmlFor="remember" className="font-normal">Manter conectado</FieldLabel>
          </Field>
        )}
      />

      {serverError && <p role="alert" className="text-sm font-semibold text-red-ink">{serverError}</p>}

      <Button type="submit" size="lg" disabled={pending}>{pending ? "Entrando…" : "Entrar no painel"}</Button>
      <p className="text-center text-[13px] text-ink-quiet">Acesso restrito à equipe da academia.</p>
    </form>
  )
}
