"use client"

import { useState, useTransition } from "react"
import { Controller, useForm, useWatch, type Control, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TermDocument } from "@/components/brand/term-document"
import { IconCheck } from "@/components/brand/icons"
import { BELTS, BELT_IDS, stripesText } from "@/domain/belts"
import { maskCpf } from "@/domain/cpf"
import { TERM_VERSION } from "@/domain/term"
import { brl, maskPhone } from "@/lib/format"
import { ddmmyyyy, dateOnly } from "@/lib/dates"
import { DUE_DAYS, enrollmentSchema, isMinorOn, STRIPE_OPTIONS, type EnrollmentFormValues, type EnrollmentInput } from "@/lib/validations/enrollment"
import { enrollAction } from "@/server/actions/student.actions"

type Plan = { name: string; description: string; priceCents: number }

const EMPTY: EnrollmentFormValues = {
  fullName: "", birthDate: "", phone: "", cpf: "", address: "", guardianName: "", guardianPhone: "", guardianCpf: "",
  belt: "branca", stripes: "0", plan: "Mensal", dueDay: "5", accepted: false as unknown as true,
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2.5 text-[22px]">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-gold text-[15px]">{n}</span>
        {title}
      </h2>
      {children}
    </Card>
  )
}

const grid = "grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4"

function TextField({
  control, name, label, className, mask, ...input
}: { control: Control<EnrollmentFormValues, unknown, EnrollmentInput>; name: FieldPath<EnrollmentFormValues>; label: string; className?: string; mask?: (v: string) => string } & React.ComponentProps<"input">) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...input}
            id={name}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={String(field.value ?? "")}
            onChange={(e) => field.onChange(mask ? mask(e.target.value) : e.target.value)}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

export function EnrollmentForm({ plans }: { plans: Plan[] }) {
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()
  const form = useForm<EnrollmentFormValues, unknown, EnrollmentInput>({ resolver: zodResolver(enrollmentSchema), defaultValues: EMPTY })
  const v = useWatch({ control: form.control })
  const isMinor = isMinorOn(v.birthDate ?? "")

  const onSubmit = form.handleSubmit(() =>
    startTransition(async () => {
      const r = await enrollAction(form.getValues())
      if (!r.ok) {
        Object.entries(r.fieldErrors ?? {}).forEach(([k, v]) => form.setError(k as FieldPath<EnrollmentFormValues>, { message: v[0] }))
        return void toast.error(r.error)
      }
      setSent(true)
      window.scrollTo(0, 0)
    })
  )

  if (sent) {
    return (
      <Card className="flex flex-col items-center gap-4 px-7 py-12 text-center">
        <div className="flex size-[76px] items-center justify-center rounded-full bg-gold text-ink"><IconCheck /></div>
        <h2 className="text-[30px]">Matrícula enviada!</h2>
        <p className="max-w-[460px] leading-normal text-ink-muted">Recebemos seus dados. A equipe da academia vai confirmar sua matrícula pelo WhatsApp. Oss!</p>
        <Button variant="outline" onClick={() => { form.reset(EMPTY); setSent(false) }}>Fazer outro cadastro</Button>
      </Card>
    )
  }

  const c = form.control
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[22px]">
      <Step n={1} title="Dados do aluno">
        <div className={grid}>
          <TextField control={c} name="fullName" label="Nome completo *" autoComplete="name" className="col-span-full" />
          <TextField control={c} name="birthDate" label="Data de nascimento *" type="date" />
          <TextField control={c} name="cpf" label={isMinor ? "CPF do aluno (opcional)" : "CPF *"} inputMode="numeric" placeholder="000.000.000-00" mask={maskCpf} />
          <TextField control={c} name="phone" label="Telefone *" type="tel" inputMode="numeric" placeholder="(13) 90000-0000" mask={maskPhone} />
          <TextField control={c} name="address" label="Endereço *" placeholder="Rua, número, bairro, cidade" autoComplete="street-address" className="col-span-full" />
        </div>
        {isMinor && (
          <div className="flex flex-col gap-3 rounded-lg bg-gold-soft p-[18px]">
            <p className="m-0 text-sm font-semibold">Aluno menor de 18 anos: o responsável legal preenche os dados abaixo e aceita o termo.</p>
            <div className={grid}>
              <TextField control={c} name="guardianName" label="Nome do responsável *" className="col-span-full" />
              <TextField control={c} name="guardianCpf" label="CPF do responsável *" inputMode="numeric" placeholder="000.000.000-00" mask={maskCpf} />
              <TextField control={c} name="guardianPhone" label="Contato do responsável *" type="tel" inputMode="numeric" placeholder="(13) 90000-0000" mask={maskPhone} />
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="Experiência no Jiu-Jitsu">
        <div className={grid}>
          <Controller
            name="belt"
            control={c}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="belt">Faixa atual</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="belt"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BELT_IDS.map((b, i) => <SelectItem key={b} value={b}>{BELTS[b].name}{i === 0 ? " (iniciante)" : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="stripes"
            control={c}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="stripes">Graus na faixa</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="stripes"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STRIPE_OPTIONS.map((n) => <SelectItem key={n} value={n}>{stripesText(Number(n))}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>
      </Step>

      <Step n={3} title="Plano">
        <Controller
          name="plan"
          control={c}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <div role="group" aria-label="Plano" className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
                {plans.map((p) => {
                  const on = field.value === p.name
                  return (
                    <button
                      key={p.name}
                      type="button"
                      aria-pressed={on}
                      onClick={() => field.onChange(p.name)}
                      className={cn("flex flex-col items-start gap-1.5 rounded-lg p-[18px] text-left text-ink", on ? "border-[3px] border-ink bg-gold-soft" : "border-[1.5px] border-edge bg-white")}
                    >
                      <span className="display text-xl">{p.name}</span>
                      <span className="text-sm text-ink-muted">{p.description}</span>
                      <span className="display tabular text-[22px]">{brl(p.priceCents)}/mês</span>
                    </button>
                  )
                })}
              </div>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />
        <Controller
          name="dueDay"
          control={c}
          render={({ field }) => (
            <Field className="max-w-80">
              <FieldLabel htmlFor="dueDay">Melhor dia de vencimento</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="dueDay"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DUE_DAYS.map((d) => <SelectItem key={d} value={d}>Dia {d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </Step>

      <Step n={4} title="Termo de responsabilidade">
        <p className="m-0 text-sm text-ink-muted">Leia o termo até o fim. Os dados de identificação vêm do que você preencheu acima.</p>
        <div role="region" aria-label="Texto do termo de responsabilidade" tabIndex={0} className="max-h-[360px] overflow-y-auto rounded-lg border-[1.5px] border-edge bg-white p-[18px]">
          <TermDocument
            isMinor={isMinor}
            identification={[
              ["Nome completo", v.fullName ?? ""],
              ["Data de nascimento", v.birthDate ? ddmmyyyy(dateOnly(v.birthDate)) : ""],
              ["CPF", v.cpf ?? ""],
              ["Telefone", v.phone ?? ""],
              ["Endereço", v.address ?? ""],
              ...(isMinor ? ([["Responsável", v.guardianName ?? ""], ["CPF do responsável", v.guardianCpf ?? ""]] as [string, string][]) : []),
            ]}
          />
        </div>
        <Controller
          name="accepted"
          control={c}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-start gap-3">
                <Checkbox id="accepted" checked={field.value === true} onCheckedChange={(x) => field.onChange(x === true)} aria-invalid={fieldState.invalid} className="mt-0.5" />
                <label htmlFor="accepted" className="text-sm leading-normal">
                  {isMinor
                    ? "Sou pai, mãe ou responsável legal pelo aluno, li e aceito o Termo de Responsabilidade e Ciência e autorizo a prática do Jiu-Jitsu. Declaro que as informações são verdadeiras."
                    : "Li e aceito o Termo de Responsabilidade e Ciência e declaro que as informações são verdadeiras."}
                </label>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <p className="m-0 text-[13px] text-ink-quiet">O aceite fica registrado com data, hora e versão do termo ({TERM_VERSION}).</p>
      </Step>

      <Button type="submit" variant="dark" size="lg" disabled={pending} className="min-h-14 text-xl">
        {pending ? "Enviando…" : "Enviar matrícula"}
      </Button>
    </form>
  )
}
