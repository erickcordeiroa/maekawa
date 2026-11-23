"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { BeltDot } from "@/components/brand/belt"
import type { BeltId } from "@/domain/belts"
import { moveDateError } from "@/domain/graduation-history"
import { graduationDateSchema, type GraduationDateInput } from "@/lib/validations/graduation"
import { moveGraduationDateAction } from "@/server/actions/student.actions"

export type HistoryItem = { id: number; label: string; date: string; dateISO: string; belt: BeltId }

type Props = { items: HistoryItem[]; birthISO: string; todayISO: string }

/** Histórico de graduações (mais recente primeiro), com ajuste da data de cada lançamento */
export function HistoryList({ items, birthISO, todayISO }: Props) {
  const [editing, setEditing] = useState<number | null>(null)

  return (
    <ol className="m-0 list-none p-0">
      {items.map((h, i) => (
        <li key={h.id} className="flex gap-3.5">
          <div className="flex w-4 flex-col items-center" aria-hidden>
            <BeltDot belt={h.belt} />
            <span className="w-0.5 flex-1 bg-[#E0E0E0]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap justify-between gap-x-3 gap-y-1 pb-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">{h.label}</span>
              <span className="text-[13px] text-ink-quiet">Prof. Murilo K. Maekawa</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="tabular text-sm font-semibold">{h.date}</span>
              {editing !== h.id && (
                <button
                  type="button"
                  onClick={() => setEditing(h.id)}
                  className="relative text-[13px] text-ink-quiet underline underline-offset-2 before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] hover:text-ink"
                  aria-label={`Alterar data de ${h.label}`}
                >
                  alterar data
                </button>
              )}
            </div>
            {editing === h.id && (
              <DateEditor
                item={h}
                // a lista vem do mais recente para o mais antigo
                prev={items[i + 1]}
                next={items[i - 1]}
                birthISO={birthISO}
                todayISO={todayISO}
                onDone={() => setEditing(null)}
              />
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

type EditorProps = { item: HistoryItem; prev?: HistoryItem; next?: HistoryItem; birthISO: string; todayISO: string; onDone: () => void }

function DateEditor({ item, prev, next, birthISO, todayISO, onDone }: EditorProps) {
  const [pending, startTransition] = useTransition()
  const form = useForm<GraduationDateInput>({ resolver: zodResolver(graduationDateSchema), defaultValues: { graduationId: item.id, date: item.dateISO } })
  const id = `gradDate${item.id}`

  const onSubmit = form.handleSubmit((data) => {
    const near = (x?: HistoryItem) => x && { label: x.label, dateISO: x.dateISO }
    const err = moveDateError(data.date, { prev: near(prev), next: near(next) }, { birthISO, todayISO })
    if (err) return form.setError("date", { message: err })
    if (data.date === item.dateISO) return onDone()
    startTransition(async () => {
      const r = await moveGraduationDateAction(data)
      if (r.ok) {
        toast(r.message)
        onDone()
      } else form.setError("date", { message: r.error })
    })
  })

  const error = form.formState.errors.date
  return (
    <form onSubmit={onSubmit} noValidate className="basis-full">
      <Field data-invalid={!!error} className="gap-1.5">
        <FieldLabel htmlFor={id} className="text-[13px]">Nova data</FieldLabel>
        <div className="flex flex-wrap items-center gap-2">
          <Input id={id} type="date" min={prev?.dateISO ?? birthISO} max={next?.dateISO ?? todayISO} aria-invalid={!!error} className="w-44" autoFocus {...form.register("date")} />
          <Button type="submit" variant="dark" size="sm" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancelar</Button>
        </div>
        <FieldError errors={[error]} />
      </Field>
    </form>
  )
}
