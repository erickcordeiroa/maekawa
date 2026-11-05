"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { graduationSchema } from "@/lib/validations/graduation"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { addStripeAction, confirmEnrollmentAction, promoteAction, removeStripeAction } from "@/server/actions/student.actions"
import type { ActionResult } from "@/server/actions/result"

type Props = {
  studentId: number
  canAddStripe: boolean
  canRemoveStripe: boolean
  stripes: number
  nextBelt: string | null
  defaultDate: string
}

export function GraduationPanel({ studentId, canAddStripe, canRemoveStripe, stripes, nextBelt, defaultDate }: Props) {
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
        <Input id="gradDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!error} />
        <FieldError>{error}</FieldError>
      </Field>
      <div className="flex flex-wrap gap-2.5">
        <Button disabled={!canAddStripe || pending} onClick={() => run(addStripeAction)}>+ Adicionar grau</Button>
        {nextBelt && (
          <Button variant="outline" disabled={pending} onClick={() => run(promoteAction)}>Promover para faixa {nextBelt}</Button>
        )}
      </div>
      {canRemoveStripe && <RemoveStripeButton studentId={studentId} stripes={stripes} />}
      <span className="text-[13px] text-ink-muted">
        {canAddStripe ? "O novo grau ou faixa fica salvo no histórico com a data escolhida." : "Grau máximo atingido nesta faixa. O próximo passo é a promoção."}
      </span>
    </div>
  )
}

/** Remove o grau atual (lançado por engano). Pede confirmação porque apaga o registro do histórico. */
function RemoveStripeButton({ studentId, stripes }: { studentId: number; stripes: number }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      const r = await removeStripeAction({ studentId })
      if (r.ok) {
        toast(r.message)
        setOpen(false)
      } else toast.error(r.error)
    })
  }

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>− Remover grau</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogTitle className="font-display text-2xl font-semibold uppercase">Remover {stripes}º grau?</DialogTitle>
          <DialogDescription className="text-[15px] text-ink-muted">
            O aluno volta para {stripes - 1 === 0 ? "nenhum grau" : `${stripes - 1} grau(s)`} na faixa atual e o registro sai do histórico de graduações.
          </DialogDescription>
          <div className="flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="button" variant="red" disabled={pending} onClick={confirm}>{pending ? "Removendo…" : "Remover grau"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
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
