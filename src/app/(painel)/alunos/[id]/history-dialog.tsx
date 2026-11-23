"use client"

import { useState, useTransition } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Belt } from "@/components/brand/belt"
import { beltName, stripesText, type BeltId } from "@/domain/belts"
import { historyDateErrors, historyPath, startBeltOptions, stepLabel, type HistoryStep } from "@/domain/graduation-history"
import { historySchema, type HistoryInput } from "@/lib/validations/graduation"
import { replaceHistoryAction } from "@/server/actions/student.actions"

export type HistoryEntry = { kind: string; belt: BeltId; stripes: number; dateISO: string }

type Props = {
  studentId: number
  belt: BeltId
  stripes: number
  isKids: boolean
  birthISO: string
  todayISO: string
  history: HistoryEntry[]
  label?: string
  variant?: "ghost" | "dark"
}

/** Data já lançada para o mesmo passo (mesmo tipo, faixa e grau), para não redigitar */
function prefill(steps: HistoryStep[], history: HistoryEntry[]) {
  return steps.map((step) => ({
    date: history.find((h) => h.kind === step.kind && h.belt === step.belt && h.stripes === step.stripes)?.dateISO ?? "",
  }))
}

/** O professor passa o histórico do caderno: uma data por passo, do início até a faixa atual */
export function HistoryLaunchButton({ studentId, belt, stripes, isKids, birthISO, todayISO, history, label = "Lançar histórico", variant = "ghost" }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const options = startBeltOptions(belt, isKids)

  function initialStart(): BeltId {
    const inicio = history.find((h) => h.kind === "inicio" && h.stripes === 0 && options.includes(h.belt))
    return inicio?.belt ?? options[0]
  }
  function valuesFor(start: BeltId): HistoryInput {
    return { studentId, startBelt: start, steps: prefill(historyPath(start, belt, stripes, isKids), history) }
  }

  const form = useForm<HistoryInput>({ resolver: zodResolver(historySchema), defaultValues: valuesFor(initialStart()) })
  const { fields } = useFieldArray({ control: form.control, name: "steps" })
  const startBelt = useWatch({ control: form.control, name: "startBelt" })
  const dates = useWatch({ control: form.control, name: "steps" })?.map((s) => s?.date ?? "") ?? []
  const path = historyPath(startBelt, belt, stripes, isKids)
  const orderErrors = historyDateErrors(path, dates, { birthISO, todayISO })
  const filled = dates.filter(Boolean).length
  const invalid = orderErrors.filter(Boolean).length

  function openDialog() {
    form.reset(valuesFor(initialStart()))
    setOpen(true)
  }

  /** Ao trocar a faixa de início, mantém as datas já digitadas dos passos que continuam na lista */
  function keepDates(start: BeltId) {
    const typed = new Map(path.map((s, i) => [`${s.kind}:${s.belt}:${s.stripes}`, dates[i]]))
    const next = historyPath(start, belt, stripes, isKids)
    const base = prefill(next, history)
    return next.map((s, i) => ({ date: typed.get(`${s.kind}:${s.belt}:${s.stripes}`) || base[i].date }))
  }

  const onSubmit = form.handleSubmit((data) => {
    if (invalid) return
    startTransition(async () => {
      const r = await replaceHistoryAction(data)
      if (r.ok) {
        toast(r.message)
        setOpen(false)
      } else toast.error(r.error)
    })
  })

  return (
    <>
      <Button variant={variant} size="sm" onClick={openDialog}>{label}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(660px,calc(100%-40px))]">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <DialogTitle className="font-display text-2xl font-semibold uppercase">Lançar histórico</DialogTitle>
            <DialogDescription className="text-[15px] leading-normal text-ink-muted">
              Preencha as datas anotadas, do início até a faixa atual ({beltName(belt)} · {stripesText(stripes)}). Passo sem data fica de fora. A faixa atual do aluno não muda.
            </DialogDescription>

            <Field className="max-w-64">
              <FieldLabel htmlFor="histStart">Começou na faixa</FieldLabel>
              <Select
                value={startBelt}
                onValueChange={(v) => form.reset({ ...valuesFor(v as BeltId), steps: keepDates(v as BeltId) })}
              >
                <SelectTrigger id="histStart"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((b) => <SelectItem key={b} value={b}>{beltName(b)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <ol className="m-0 flex list-none flex-col overflow-hidden rounded-lg border border-line p-0">
              {fields.map((f, i) => {
                const step = path[i]
                if (!step) return null
                const error = form.formState.errors.steps?.[i]?.date?.message ?? orderErrors[i]
                const id = `histStep${i}`
                return (
                  <li key={f.id} className={`border-t border-line px-3 py-2.5 first:border-t-0 ${step.kind === "grau" ? "" : "bg-panel"}`}>
                    <Field data-invalid={!!error} className="grid grid-cols-[96px_minmax(0,1fr)_170px] items-center gap-x-3 gap-y-1 max-[520px]:grid-cols-1">
                      <span className="flex"><Belt belt={step.belt} stripes={step.stripes} /></span>
                      <FieldLabel htmlFor={id} className="flex flex-col items-start gap-0 text-sm">
                        {stepLabel(step)}
                        {!dates[i] && <span className="text-[12.5px] font-normal text-ink-quiet">Sem data · fica fora do histórico</span>}
                      </FieldLabel>
                      <Input id={id} type="date" min={birthISO} max={todayISO} aria-invalid={!!error} {...form.register(`steps.${i}.date`)} />
                      <FieldError className="col-start-2 col-end-4 max-[520px]:col-start-1">{error}</FieldError>
                    </Field>
                  </li>
                )
              })}
            </ol>

            <FieldError errors={[form.formState.errors.steps?.root ?? form.formState.errors.steps]} />
            <p className={`m-0 text-sm ${invalid ? "font-semibold text-red-ink" : "text-ink-muted"}`} aria-live="polite">
              {invalid
                ? `${invalid} ${invalid === 1 ? "data precisa" : "datas precisam"} de correção antes de salvar.`
                : `${filled} de ${path.length} passos com data. Salvar substitui o histórico atual (${history.length} ${history.length === 1 ? "lançamento" : "lançamentos"}).`}
            </p>

            <div className="flex flex-wrap justify-end gap-2.5">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="dark" disabled={pending || !!invalid || !filled}>{pending ? "Salvando…" : "Salvar histórico"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
