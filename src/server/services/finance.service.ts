import "server-only"
import { requestToday } from "@/server/request"
import { transactionRepository } from "@/server/repositories/transaction.repository"
import { addMonths, dateOnly, ddmm, MONTHS, MONTHS_SHORT, monthRef } from "@/lib/dates"
import { PERIODS, type Period } from "@/domain/finance"
import type { TransactionInput } from "@/lib/validations/finance"

export const parsePeriod = (v?: string): Period => (PERIODS.find((p) => String(p) === v) ?? 6)

export async function financeOverview(period: Period) {
  const today = await requestToday()
  const thisMonth = dateOnly(`${monthRef(today)}-01`)
  const from = addMonths(thisMonth, -(period - 1))
  const txs = await transactionRepository.inRange(from, addMonths(thisMonth, 1))

  const months = Array.from({ length: period }, (_, i) => {
    const m = addMonths(from, i)
    const ref = monthRef(m)
    const inMonth = txs.filter((t) => monthRef(t.date) === ref)
    const income = inMonth.filter((t) => t.kind === "entrada").reduce((a, t) => a + t.amountCents, 0)
    const expense = inMonth.filter((t) => t.kind === "saida").reduce((a, t) => a + t.amountCents, 0)
    return { label: MONTHS_SHORT[m.getUTCMonth()], income, expense, profit: income - expense }
  })

  const income = months.reduce((a, m) => a + m.income, 0)
  const expense = months.reduce((a, m) => a + m.expense, 0)
  const profit = income - expense

  const current = txs.filter((t) => monthRef(t.date) === monthRef(thisMonth))
  const breakdown = (kind: string) => {
    const map = new Map<string, number>()
    for (const t of current.filter((t) => t.kind === kind)) map.set(t.category, (map.get(t.category) ?? 0) + t.amountCents)
    const total = [...map.values()].reduce((a, v) => a + v, 0)
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, pct: total ? Math.round((value / total) * 100) : 0 }))
  }

  return {
    period,
    monthName: MONTHS[thisMonth.getUTCMonth()].toLowerCase(),
    months,
    totals: { income, expense, profit, margin: income ? Math.round((profit / income) * 100) : 0, avgProfit: Math.round(profit / period) },
    expenses: breakdown("saida"),
    sources: breakdown("entrada"),
    transactions: txs.map((t) => ({ id: t.id, date: ddmm(t.date), description: t.description, signed: t.kind === "entrada" ? t.amountCents : -t.amountCents })),
  }
}

export type FinanceOverview = Awaited<ReturnType<typeof financeOverview>>

export async function createTransaction(input: TransactionInput) {
  await transactionRepository.create({
    date: await requestToday(),
    description: input.description,
    kind: input.kind,
    category: input.kind === "entrada" ? "Outras entradas" : "Outras saídas",
    amountCents: Math.round(input.amount * 100),
  })
}
