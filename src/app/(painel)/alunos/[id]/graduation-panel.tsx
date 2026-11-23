"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { graduationSchema } from "@/lib/validations/graduation"
import { addStripeAction, confirmEnrollmentAction, promoteAction } from "@/server/actions/student.actions"
import type { BeltId } from "@/domain/belts"
import { BeltCorrectionButton } from "./belt-correction"
import { HistoryLaunchButton, type HistoryEntry } from "./history-dialog"
import type { ActionResult } from "@/server/actions/result"

type Props = {
  studentId: number
  canAddStripe: boolean
  belt: BeltId
  stripes: number
  nextBelt: string | null
  defaultDate: string
  isKids: boolean
  birthISO: string
  history: HistoryEntry[]
}

export function GraduationPanel({ studentId, canAddStripe, belt, stripes, nextBelt, defaultDate, isKids, birthISO, history }: Props) {
  const [date, setDate] = useState(defaultDate)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function run(action: (i: { studentId: number; date: string }) => Promise<ActionResult>) {
    const parsed = graduationSchema.safeParse({ studentId, date })
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    setError(null)
    startTransition(async () => {
      const r = await action(parsed.data)
      if (r.ok) toast(r.message)
      else toast.error(r.error)
    })
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-lg bg-panel p-[18px]">
      <Field data-invalid={!!error} className="max-w-60">
        <FieldLabel htmlFor="gradDate">Data da graduação</FieldLabel>
        <Input id="gradDate" type="date" min={birthISO} max={defaultDate} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!error} />
        <FieldError>{error}</FieldError>
      </Field>
      <div className="flex flex-wrap gap-2.5">
        <Button disabled={!canAddStripe || pending} onClick={() => run(addStripeAction)}>+ Adicionar grau</Button>
        {nextBelt && (
          <Button variant="outline" disabled={pending} onClick={() => run(promoteAction)}>Promover para faixa {nextBelt}</Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <BeltCorrectionButton studentId={studentId} belt={belt} stripes={stripes} />
        <HistoryLaunchButton studentId={studentId} belt={belt} stripes={stripes} isKids={isKids} birthISO={birthISO} todayISO={defaultDate} history={history} />
      </div>
      <span className="text-[13px] text-ink-muted">
        {canAddStripe ? "O novo grau ou faixa fica salvo no histórico com a data escolhida." : "Grau máximo atingido nesta faixa. O próximo passo é a promoção."}
      </span>
    </div>
  )
}

export function ConfirmEnrollmentButton({ studentId }: { studentId: number }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await confirmEnrollmentAction({ studentId })
          if (r.ok) toast(r.message)
          else toast.error(r.error)
        })
      }
    >
      {pending ? "Confirmando…" : "Confirmar matrícula"}
    </Button>
  )
}

export function PrintButton() {
  return <Button variant="outline" onClick={() => window.print()} className="print:hidden">Imprimir</Button>
}
