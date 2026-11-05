"use client"

import { useState, useTransition } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BELT_IDS, beltName, maxStripes, stripesText, type BeltId } from "@/domain/belts"
import { beltCorrectionSchema, type BeltCorrectionFormValues, type BeltCorrectionInput } from "@/lib/validations/graduation"
import { correctBeltAction } from "@/server/actions/student.actions"

type Props = { studentId: number; belt: BeltId; stripes: number }

/** O administrador volta a faixa e os graus do aluno quando um grau ou promoção foi lançado por engano */
export function BeltCorrectionButton({ studentId, belt, stripes }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const current: BeltCorrectionFormValues = { studentId, belt, stripes: String(stripes) }
  const form = useForm<BeltCorrectionFormValues, unknown, BeltCorrectionInput>({ resolver: zodResolver(beltCorrectionSchema), defaultValues: current })
  const chosenBelt = useWatch({ control: form.control, name: "belt" })
  const stripeOptions = Array.from({ length: maxStripes(chosenBelt) + 1 }, (_, i) => String(i))

  function openDialog() {
    form.reset(current)
    setOpen(true)
  }

  const onSubmit = form.handleSubmit((data) =>
    startTransition(async () => {
      const r = await correctBeltAction({ ...data, stripes: String(data.stripes) })
      if (r.ok) {
        toast(r.message)
        setOpen(false)
      } else toast.error(r.error)
    })
  )

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" onClick={openDialog}>Corrigir faixa e graus</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[460px]">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <DialogTitle className="font-display text-2xl font-semibold uppercase">Corrigir faixa e graus</DialogTitle>
            <DialogDescription className="text-[15px] leading-normal text-ink-muted">
              Hoje: faixa {beltName(belt)} · {stripesText(stripes)}. Use para desfazer um grau ou uma promoção lançados por engano: o que foi registrado depois dessa faixa sai do histórico.
            </DialogDescription>
            <div className="grid grid-cols-2 gap-3.5">
              <Controller
                name="belt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="fixBelt">Faixa</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v)
                        // Ao trocar para uma faixa com menos graus possíveis, ajusta os graus
                        if (Number(form.getValues("stripes")) > maxStripes(v)) form.setValue("stripes", String(maxStripes(v)))
                      }}
                    >
                      <SelectTrigger id="fixBelt" aria-invalid={fieldState.invalid}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BELT_IDS.map((b) => <SelectItem key={b} value={b}>{beltName(b)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="stripes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="fixStripes">Graus</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="fixStripes" aria-invalid={fieldState.invalid}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {stripeOptions.map((n) => <SelectItem key={n} value={n}>{stripesText(Number(n))}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <div className="flex justify-end gap-2.5">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="dark" disabled={pending}>{pending ? "Salvando…" : "Salvar correção"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
