"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Chip, ChipGroup } from "@/components/brand/chip"
import { IconPlus } from "@/components/brand/icons"
import { transactionSchema, type TransactionFormValues, type TransactionInput } from "@/lib/validations/finance"
import { createTransactionAction } from "@/server/actions/finance.actions"

const EMPTY: TransactionFormValues = { kind: "entrada", description: "", amount: "" }

export function NewTransactionButton() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const form = useForm<TransactionFormValues, unknown, TransactionInput>({ resolver: zodResolver(transactionSchema), defaultValues: EMPTY })

  // O schema roda no cliente (resolver) e de novo no servidor; enviamos os valores crus do formulário
  const onSubmit = form.handleSubmit(() =>
    startTransition(async () => {
      const r = await createTransactionAction(form.getValues())
      if (!r.ok) {
        Object.entries(r.fieldErrors ?? {}).forEach(([k, v]) => form.setError(k as keyof TransactionFormValues, { message: v[0] }))
        return void toast.error(r.error)
      }
      toast(r.message)
      form.reset(EMPTY)
      setOpen(false)
    })
  )

  return (
    <>
      <Button variant="dark" className="min-h-12" onClick={() => setOpen(true)}>
        <IconPlus />
        Novo lançamento
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) form.reset(EMPTY) }}>
        <DialogContent aria-describedby={undefined}>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <DialogTitle className="font-display text-2xl font-semibold uppercase">Novo lançamento</DialogTitle>
            <Controller
              name="kind"
              control={form.control}
              render={({ field }) => (
                <ChipGroup aria-label="Tipo">
                  <Chip pressed={field.value === "entrada"} onClick={() => field.onChange("entrada")}>Entrada</Chip>
                  <Chip pressed={field.value === "saida"} onClick={() => field.onChange("saida")}>Saída</Chip>
                </ChipGroup>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="enDesc">Descrição</FieldLabel>
                  <Input {...field} id="enDesc" placeholder="Ex.: Venda de faixa" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="enVal">Valor (R$)</FieldLabel>
                  <Input {...field} id="enVal" inputMode="decimal" placeholder="0,00" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
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
