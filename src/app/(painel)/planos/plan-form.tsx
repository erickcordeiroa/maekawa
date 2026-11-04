"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { IconPlus } from "@/components/brand/icons"
import { planSchema, type PlanFormValues, type PlanInput } from "@/lib/validations/plan"
import { savePlanAction, setPlanActiveAction } from "@/server/actions/plan.actions"
import type { PlanRow } from "@/server/services/plan.service"

const EMPTY: PlanFormValues = { name: "", description: "", price: "", isKids: false }

const toForm = (p: PlanRow): PlanFormValues => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: (p.priceCents / 100).toFixed(2).replace(".", ","),
  isKids: p.isKids,
})

/** Sem `plan`: botão "Novo plano". Com `plan`: botão "Editar" da linha. */
export function PlanFormButton({ plan }: { plan?: PlanRow }) {
  const initial = plan ? toForm(plan) : EMPTY
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const form = useForm<PlanFormValues, unknown, PlanInput>({ resolver: zodResolver(planSchema), defaultValues: initial })

  const onSubmit = form.handleSubmit(() =>
    startTransition(async () => {
      const r = await savePlanAction(form.getValues())
      if (!r.ok) {
        Object.entries(r.fieldErrors ?? {}).forEach(([k, v]) => form.setError(k as keyof PlanFormValues, { message: v[0] }))
        return void toast.error(r.error)
      }
      toast(r.message)
      setOpen(false)
    })
  )

  const field = (name: "name" | "description" | "price", label: string, props: React.ComponentProps<"input"> = {}) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`plan-${name}`}>{label}</FieldLabel>
          <Input {...field} {...props} id={`plan-${name}`} aria-invalid={fieldState.invalid} />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )

  return (
    <>
      {plan ? (
        <Button variant="outline" onClick={() => { form.reset(initial); setOpen(true) }}>Editar</Button>
      ) : (
        <Button variant="dark" className="min-h-12" onClick={() => { form.reset(EMPTY); setOpen(true) }}>
          <IconPlus />
          Novo plano
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <DialogTitle className="font-display text-2xl font-semibold uppercase">{plan ? "Editar plano" : "Novo plano"}</DialogTitle>
            {field("name", "Nome do plano", { placeholder: "Ex.: Semestral" })}
            {field("description", "Descrição curta", { placeholder: "Ex.: Adulto · 6 meses" })}
            {field("price", "Valor mensal (R$)", { inputMode: "decimal", placeholder: "0,00" })}
            <Controller
              name="isKids"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox id="plan-isKids" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} className="mt-0.5" />
                  <label htmlFor="plan-isKids" className="text-sm leading-normal">
                    Plano infantil (Kids): o aluno entra direto na turma Kids
                  </label>
                </div>
              )}
            />
            {plan && plan.students > 0 && (
              <p className="m-0 text-[13px] text-ink-muted">
                {plan.students} aluno(s) ativo(s) neste plano. Um novo valor vale para as próximas mensalidades; as já lançadas não mudam.
              </p>
            )}
            <div className="flex justify-end gap-2.5">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function PlanActiveToggle({ id, active }: { id: number; active: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await setPlanActiveAction({ id, active: !active })
          if (r.ok) toast(r.message)
          else toast.error(r.error)
        })
      }
    >
      {active ? "Inativar" : "Reativar"}
    </Button>
  )
}
