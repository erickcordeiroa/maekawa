"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch, type Control, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chip, ChipGroup } from "@/components/brand/chip"
import { maskCpf } from "@/domain/cpf"
import { maskPhone } from "@/lib/format"
import { DUE_DAYS } from "@/lib/validations/enrollment"
import { STUDENT_STATUSES, STUDENT_STATUS_LABEL, studentEditSchema, type StudentEditFormValues, type StudentEditInput } from "@/lib/validations/student"
import { updateStudentAction } from "@/server/actions/student.actions"
import type { StudentEditData } from "@/server/services/student.service"

type Ctl = Control<StudentEditFormValues, unknown, StudentEditInput>
const grid = "grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4"
const NO_CLASS = "none" // o Select não aceita valor vazio

function TextField({ control, name, label, className, mask, hint, ...input }: { control: Ctl; name: FieldPath<StudentEditFormValues>; label: string; className?: string; mask?: (v: string) => string; hint?: string } & React.ComponentProps<"input">) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input {...input} id={name} name={field.name} ref={field.ref} onBlur={field.onBlur} value={String(field.value ?? "")} onChange={(e) => field.onChange(mask ? mask(e.target.value) : e.target.value)} aria-invalid={fieldState.invalid} />
          {hint && <FieldDescription>{hint}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

function SelectField({ control, name, label, options, className }: { control: Ctl; name: "planId" | "classGroupId" | "dueDay" | "status"; label: string; options: { value: string; label: string }[]; className?: string }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            value={name === "classGroupId" ? String(field.value || NO_CLASS) : String(field.value)}
            onValueChange={(v) => field.onChange(name === "classGroupId" && v === NO_CLASS ? "" : v)}
          >
            <SelectTrigger id={name} aria-invalid={fieldState.invalid}><SelectValue /></SelectTrigger>
            <SelectContent>
              {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

export function StudentEditForm({ data }: { data: StudentEditData }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const form = useForm<StudentEditFormValues, unknown, StudentEditInput>({ resolver: zodResolver(studentEditSchema), defaultValues: data.values })
  const c = form.control
  const isMinor = useWatch({ control: c, name: "isMinor" })
  const status = useWatch({ control: c, name: "status" })

  const onSubmit = form.handleSubmit(() =>
    startTransition(async () => {
      const r = await updateStudentAction(form.getValues())
      if (!r.ok) {
        Object.entries(r.fieldErrors ?? {}).forEach(([k, v]) => form.setError(k as FieldPath<StudentEditFormValues>, { message: v[0] }))
        return void toast.error(r.error)
      }
      toast(r.message)
      router.push(`/alunos/${data.values.id}`)
    })
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-[900px] flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <CardTitle>Dados pessoais</CardTitle>
        <div className={grid}>
          <TextField control={c} name="fullName" label="Nome completo *" className="col-span-full" />
          <TextField control={c} name="shortName" label="Nome de exibição *" hint="Como aparece nas listas e na chamada." />
          <TextField control={c} name="birthDate" label="Data de nascimento *" type="date" />
          <TextField control={c} name="cpf" label="CPF" inputMode="numeric" placeholder="000.000.000-00" mask={maskCpf} />
          <TextField control={c} name="phone" label="Telefone *" type="tel" inputMode="numeric" mask={maskPhone} />
          <TextField control={c} name="address" label="Endereço *" className="col-span-full" />
        </div>
        <Controller
          name="isMinor"
          control={c}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2.5">
              <span className="text-sm font-semibold">O aluno é menor de 18 anos?</span>
              <ChipGroup aria-label="Aluno menor de idade">
                <Chip pressed={!field.value} onClick={() => field.onChange(false)}>Não, é adulto</Chip>
                <Chip pressed={field.value} onClick={() => field.onChange(true)}>Sim, é menor</Chip>
              </ChipGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {isMinor && (
          <div className={cn(grid, "rounded-lg bg-gold-soft p-[18px]")}>
            <TextField control={c} name="guardianName" label="Nome do responsável *" className="col-span-full" />
            <TextField control={c} name="guardianCpf" label="CPF do responsável *" inputMode="numeric" placeholder="000.000.000-00" mask={maskCpf} />
            <TextField control={c} name="guardianPhone" label="Contato do responsável *" type="tel" inputMode="numeric" mask={maskPhone} />
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <CardTitle>Matrícula</CardTitle>
        <div className={grid}>
          <SelectField control={c} name="planId" label="Plano" options={data.plans.map((p) => ({ value: String(p.id), label: p.name }))} />
          <SelectField control={c} name="classGroupId" label="Turma" options={[{ value: NO_CLASS, label: "Sem turma" }, ...data.classGroups.map((g) => ({ value: String(g.id), label: g.name }))]} />
          <SelectField control={c} name="dueDay" label="Dia de vencimento" options={DUE_DAYS.map((d) => ({ value: d, label: `Dia ${d}` }))} />
          <SelectField control={c} name="status" label="Situação" options={STUDENT_STATUSES.map((s) => ({ value: s, label: STUDENT_STATUS_LABEL[s] }))} />
        </div>
        {status === "inativo" && (
          <p className="m-0 rounded-lg bg-panel p-[18px] text-sm">
            Aluno desativado não aparece na lista de alunos nem na chamada e não consegue fazer check-in. Nada é excluído: histórico, graduações e mensalidades ficam guardados. Para reativar, encontre-o no filtro &quot;Desativados&quot; e volte a situação para Ativo.
          </p>
        )}
        <p className="m-0 text-[13px] text-ink-muted">Faixa e graus mudam pelo painel de graduação, para ficar no histórico.</p>
      </Card>

      <div className="flex flex-wrap justify-end gap-2.5">
        <Button type="button" variant="ghost" onClick={() => router.push(`/alunos/${data.values.id}`)}>Cancelar</Button>
        <Button type="submit" variant="dark" disabled={pending} className="min-h-12">{pending ? "Salvando…" : "Salvar alterações"}</Button>
      </div>
    </form>
  )
}
