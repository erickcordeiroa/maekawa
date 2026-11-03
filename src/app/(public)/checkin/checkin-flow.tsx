"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Avatar } from "@/components/brand/avatar"
import { Belt } from "@/components/brand/belt"
import { IconCheck } from "@/components/brand/icons"
import { beltName, stripesText } from "@/domain/belts"
import { maskPhone } from "@/lib/format"
import { checkinSchema, type CheckinInput } from "@/lib/validations/checkin"
import { confirmCheckinAction, lookupCheckinAction } from "@/server/actions/attendance.actions"
import type { CheckinStudent } from "@/server/services/attendance.service"

type Done = { already: boolean; time: string; firstName: string; monthCount: number; monthName: string; belt: CheckinStudent["belt"]; stripes: number }
type Step = { step: "phone" } | { step: "confirm"; student: CheckinStudent } | { step: "done"; result: Done }

const big = "min-h-[58px] rounded-xl text-[19px]"

export function CheckinFlow({ demoHint }: { demoHint: boolean }) {
  const [state, setState] = useState<Step>({ step: "phone" })
  const [pending, startTransition] = useTransition()
  const form = useForm<CheckinInput>({ resolver: zodResolver(checkinSchema), defaultValues: { phone: "" } })

  const restart = () => { form.reset({ phone: "" }); setState({ step: "phone" }) }

  if (state.step === "confirm") {
    const s = state.student
    return (
      <div className="flex flex-col gap-[18px]">
        <h1 className="text-[28px]">É você?</h1>
        <div className="flex items-center gap-3.5 rounded-xl bg-ground p-4">
          <Avatar name={s.shortName} className="size-14 text-lg" />
          <div className="flex flex-col gap-1.5">
            <b className="text-lg">{s.shortName}</b>
            <span className="inline-flex items-center gap-2 text-sm"><Belt belt={s.belt} stripes={s.stripes} />{beltName(s.belt)} · {stripesText(s.stripes)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border-2 border-ink px-4 py-3.5">
          <span className="text-[13px] text-ink-muted">Aula de agora</span>
          <span className="display text-xl">{s.className}{s.classTime && ` · ${s.classTime}`}</span>
        </div>
        <Button
          size="lg"
          className={big}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const r = await confirmCheckinAction(s.id)
              if (r.ok && r.data) setState({ step: "done", result: r.data })
              else if (!r.ok) { form.setError("phone", { message: r.error }); setState({ step: "phone" }) }
            })
          }
        >
          {pending ? "Confirmando…" : "Sim, confirmar presença"}
        </Button>
        <Button variant="ghost" className="min-h-12 rounded-xl" onClick={restart}>Não sou eu</Button>
      </div>
    )
  }

  if (state.step === "done") {
    const r = state.result
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-[88px] items-center justify-center rounded-full bg-gold text-ink"><IconCheck /></div>
        <h1 className="text-[32px]">{r.already ? "Já registrado" : "Check-in feito! Oss!"}</h1>
        <p className="text-base leading-normal">
          {r.already ? `Você já fez check-in hoje às ${r.time}. Bom treino, ${r.firstName}!` : `Presença registrada. Bom treino, ${r.firstName}!`}
        </p>
        <div className="grid w-full grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-xl bg-ink p-3.5 text-white">
            <span className="display tabular text-[30px] text-gold">{r.monthCount}</span>
            <span className="text-[13px]">treinos em {r.monthName}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-ground p-3.5">
            <span className="display text-[30px]">{beltName(r.belt)}</span>
            <span className="text-[13px]">{stripesText(r.stripes)}</span>
          </div>
        </div>
        <Button variant="ghost" onClick={restart}>Fazer outro check-in</Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit((v) =>
        startTransition(async () => {
          const r = await lookupCheckinAction(v)
          if (r.ok && r.data) setState({ step: "confirm", student: r.data })
          else if (!r.ok) form.setError("phone", { message: r.fieldErrors?.phone?.[0] ?? r.error })
        })
      )}
    >
      <div>
        <h1 className="text-[28px]">Bora treinar!</h1>
        <p className="mt-1.5 text-[15px] leading-normal text-ink-muted">Digite o telefone que você usou no cadastro para registrar sua presença.</p>
      </div>
      <Controller
        name="phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor="ckTel">Seu telefone</FieldLabel>
            <Input
              {...field}
              id="ckTel"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(13) 90000-0000"
              onChange={(e) => field.onChange(maskPhone(e.target.value))}
              aria-invalid={fieldState.invalid}
              className="h-14 rounded-lg border-2 text-[22px] tracking-[1px]"
            />
            <FieldError errors={[fieldState.error]} />
            {demoHint && <FieldDescription className="text-[13px] text-ink-quiet">Para testar: (13) 99999-0001 ou qualquer telefone da lista de alunos.</FieldDescription>}
          </Field>
        )}
      />
      <Button type="submit" size="lg" className={`${big} text-xl`} disabled={pending}>{pending ? "Buscando…" : "Fazer check-in"}</Button>
      <p className="text-center text-[13px] text-ink-quiet">Ainda não é aluno? Fale com o professor na recepção.</p>
    </form>
  )
}
