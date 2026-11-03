"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Chip, ChipGroup } from "@/components/brand/chip"
import { PaymentBadge } from "@/components/brand/payment-badge"
import { PAYMENT_TABS, type PaymentTab } from "@/domain/payments"
import { brl } from "@/lib/format"
import { chargeAction, markPaidAction, undoPaymentAction } from "@/server/actions/payment.actions"
import type { PaymentRow } from "@/server/services/payment.service"
import type { ActionResult } from "@/server/actions/result"

type Props = { rows: PaymentRow[]; counts: Record<PaymentTab, number>; initialTab: PaymentTab }

export function PaymentsTable({ rows, counts, initialTab }: Props) {
  const [tab, setTab] = useState<PaymentTab>(initialTab)
  const [pending, startTransition] = useTransition()
  const list = rows.filter((r) => tab === "todos" || r.status === tab)

  const run = (fn: () => Promise<ActionResult<{ url: string } | undefined>>) =>
    startTransition(async () => {
      const r = await fn()
      if (!r.ok) return void toast.error(r.error)
      if (r.message) toast(r.message)
      if (r.data?.url) window.open(r.data.url, "_blank", "noopener")
    })

  return (
    <Card className="flex flex-col gap-4">
      <ChipGroup aria-label="Filtrar por situação">
        {PAYMENT_TABS.map(([id, label]) => (
          <Chip key={id} pressed={tab === id} onClick={() => setTab(id)}>{label} ({counts[id]})</Chip>
        ))}
      </ChipGroup>
      <Table minWidth={840}>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-semibold">{r.studentName}</TableCell>
              <TableCell>{r.plan}</TableCell>
              <TableCell className="tabular">{brl(r.amountCents)}</TableCell>
              <TableCell className="tabular">{r.due}</TableCell>
              <TableCell><PaymentBadge {...r.badge} /></TableCell>
              <TableCell className="text-right">
                <div className="inline-flex flex-wrap justify-end gap-2">
                  {r.status !== "pago" ? (
                    <Button size="sm" disabled={pending} onClick={() => run(() => markPaidAction(r.id))}>Marcar como pago</Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => undoPaymentAction(r.id))}>Desfazer</Button>
                  )}
                  {r.status === "atrasado" && (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => chargeAction(r.id))}>Cobrar no WhatsApp</Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {list.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="p-7 text-center text-ink-muted">Ninguém nesta situação.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
