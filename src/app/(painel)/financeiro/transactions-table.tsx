"use client"

import { cn } from "cn"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, usePagination } from "@/components/brand/pagination"
import { brl } from "@/lib/format"
import type { FinanceOverview } from "@/server/services/finance.service"

export function TransactionsTable({ rows }: { rows: FinanceOverview["transactions"] }) {
  const { pageItems, pagination, topRef } = usePagination(rows, 8)

  return (
    <Card ref={topRef} className="flex min-w-0 flex-[3_1_440px] scroll-mt-24 flex-col gap-4">
      <CardTitle>Lançamentos do período</CardTitle>
      <Table minWidth={460}>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="tabular text-[#333]">{e.date}</TableCell>
              <TableCell className="font-semibold">{e.description}</TableCell>
              <TableCell><Badge variant={e.signed > 0 ? "pending" : "neutral"}>{e.signed > 0 ? "Entrada" : "Saída"}</Badge></TableCell>
              <TableCell className={cn("tabular text-right font-bold", e.signed < 0 && "text-red-ink")}>{e.signed > 0 ? "+ " : ""}{brl(e.signed)}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="p-7 text-center text-ink-muted">Nenhum lançamento neste período.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination {...pagination} noun="lançamentos" />
    </Card>
  )
}
