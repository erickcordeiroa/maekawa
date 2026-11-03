import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "cn"
import { financeOverview, parsePeriod } from "@/server/services/finance.service"
import { PageHead } from "@/components/brand/page-head"
import { Kpi, KpiGrid } from "@/components/brand/kpi"
import { HBar } from "@/components/brand/hbar"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PERIODS } from "@/domain/finance"
import { brl } from "@/lib/format"
import { NewTransactionButton } from "./new-transaction"
import { ProfitChart } from "./profit-chart"

export const metadata: Metadata = { title: "Financeiro" }

export default async function FinanceiroPage({ searchParams }: PageProps<"/financeiro">) {
  const sp = await searchParams
  const period = parsePeriod(typeof sp.periodo === "string" ? sp.periodo : undefined)
  const o = await financeOverview(period)
  const max = Math.max(1, ...o.months.map((m) => Math.max(m.income, m.expense)))
  const bw = period === 12 ? 16 : 28

  return (
    <>
      <PageHead title="Financeiro" description="Quanto entrou, quanto saiu e quanto sobrou na academia.">
        <div className="flex flex-wrap items-center gap-2.5">
          <div role="group" aria-label="Período" className="flex gap-1.5 rounded-lg bg-white p-1">
            {PERIODS.map((p) => (
              <Link key={p} href={`/financeiro?periodo=${p}`} aria-current={p === period ? "true" : undefined} className={cn("inline-flex min-h-11 items-center rounded-md px-[18px] text-sm font-bold no-underline", p === period ? "bg-ink text-gold" : "bg-transparent")}>
                {p} meses
              </Link>
            ))}
          </div>
          <NewTransactionButton />
        </div>
      </PageHead>

      <KpiGrid>
        <Kpi label="Entradas no período" value={brl(o.totals.income)} sub="Mensalidades, matrículas e loja" />
        <Kpi label="Saídas no período" value={brl(o.totals.expense)} sub="Aluguel, contas, materiais" />
        <Kpi tone="dark" label="Lucro (entradas − saídas)" value={brl(o.totals.profit)} sub={`Sobram ${o.totals.margin}% de tudo que entra`} />
        <Kpi label="Lucro médio por mês" value={brl(o.totals.avgProfit)} sub={`Últimos ${period} meses`} />
      </KpiGrid>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Entradas x saídas por mês</CardTitle>
            <CardDescription>Barra amarela é o dinheiro que entrou, barra preta é o que saiu. Quanto maior a diferença, melhor o mês. Passe o mouse para ver os valores.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5"><i className="inline-block size-3.5 rounded-[3px] border border-gold-deep bg-gold" />Entradas</span>
            <span className="inline-flex items-center gap-1.5"><i className="inline-block size-3.5 rounded-[3px] bg-ink" />Saídas</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-[520px] flex-col gap-2">
            <div className="flex h-60 items-end gap-3 border-b-2 border-ink px-1">
              {o.months.map((m) => (
                <div key={m.label} tabIndex={0} aria-label={`${m.label}: entrou ${brl(m.income)}, saiu ${brl(m.expense)}`} className="group relative flex h-full flex-1 items-end justify-center gap-1 focus-visible:outline-offset-4">
                  <span className="block rounded-t border border-b-0 border-gold-deep bg-gold" style={{ width: bw, height: Math.round((m.income / max) * 220) }} />
                  <span className="block rounded-t bg-ink" style={{ width: bw, height: Math.round((m.expense / max) * 220) }} />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 hidden -translate-x-1/2 rounded-md bg-ink px-2 py-1.5 text-xs whitespace-nowrap text-white group-hover:block group-focus-visible:block">
                    {m.label}: entrou {brl(m.income)} · saiu {brl(m.expense)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-1">
              {o.months.map((m) => <span key={m.label} className="flex-1 text-center text-[13px] text-ink-muted">{m.label}</span>)}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-stretch gap-6">
        <Card className="flex min-w-0 flex-[3_1_440px] flex-col gap-4">
          <div>
            <CardTitle>Lucro mês a mês</CardTitle>
            <CardDescription>Linha subindo quer dizer que a academia está guardando mais dinheiro a cada mês.</CardDescription>
          </div>
          <ProfitChart months={o.months} />
        </Card>
        <Card className="flex min-w-0 flex-[2_1_320px] flex-col gap-4">
          <div>
            <CardTitle>Para onde vai o dinheiro</CardTitle>
            <CardDescription>Saídas de {o.monthName} por categoria.</CardDescription>
          </div>
          <Breakdown items={o.expenses} color="var(--color-ink)" empty="Nenhuma saída lançada neste mês." />
        </Card>
      </div>

      <div className="flex flex-wrap items-stretch gap-6">
        <Card className="flex min-w-0 flex-[2_1_320px] flex-col gap-4">
          <div>
            <CardTitle>De onde vem o dinheiro</CardTitle>
            <CardDescription>Entradas de {o.monthName} por tipo.</CardDescription>
          </div>
          <Breakdown items={o.sources} color="var(--color-gold)" empty="Nenhuma entrada lançada neste mês." />
        </Card>
        <Card className="flex min-w-0 flex-[3_1_440px] flex-col gap-4">
          <CardTitle>Últimos lançamentos</CardTitle>
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
              {o.recent.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="tabular text-[#333]">{e.date}</TableCell>
                  <TableCell className="font-semibold">{e.description}</TableCell>
                  <TableCell><Badge variant={e.signed > 0 ? "pending" : "neutral"}>{e.signed > 0 ? "Entrada" : "Saída"}</Badge></TableCell>
                  <TableCell className={cn("tabular text-right font-bold", e.signed < 0 && "text-red-ink")}>{e.signed > 0 ? "+ " : ""}{brl(e.signed)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  )
}

function Breakdown({ items, color, empty }: { items: { name: string; value: number; pct: number }[]; color: string; empty: string }) {
  if (!items.length) return <p className="text-sm text-ink-muted">{empty}</p>
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((c) => (
        <li key={c.name} className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-2 text-sm">
            <span className="font-semibold">{c.name}</span>
            <span className="tabular">{brl(c.value)} · {c.pct}%</span>
          </div>
          <HBar pct={c.pct} color={color} />
        </li>
      ))}
    </ul>
  )
}
