import type { Metadata } from "next"
import Link from "next/link"
import { monthOverview } from "@/server/services/payment.service"
import { PageHead } from "@/components/brand/page-head"
import { Kpi, KpiGrid } from "@/components/brand/kpi"
import { HBar } from "@/components/brand/hbar"
import { IconBack } from "@/components/brand/icons"
import { brl } from "@/lib/format"
import { PAYMENT_TABS, type PaymentTab } from "@/domain/payments"
import { PaymentsTable } from "./payments-table"

export const metadata: Metadata = { title: "Mensalidades" }

export default async function MensalidadesPage({ searchParams }: PageProps<"/mensalidades">) {
  const sp = await searchParams
  const mes = typeof sp.mes === "string" ? sp.mes : undefined
  const tab = PAYMENT_TABS.find(([id]) => id === sp.situacao)?.[0] ?? ("todos" as PaymentTab)
  const o = await monthOverview(mes)
  const navBtn = "inline-flex min-h-11 items-center px-3 text-ink no-underline aria-disabled:pointer-events-none aria-disabled:opacity-30"

  return (
    <>
      <PageHead title="Mensalidades" description="Quem pagou, quem está pendente e quem está em atraso.">
        <div className="flex items-center gap-1 rounded-lg bg-white p-1">
          <Link href={`/mensalidades?mes=${o.prev}`} className={navBtn} aria-label="Mês anterior"><IconBack /></Link>
          <span className="display min-w-[150px] text-center text-lg">{o.label}</span>
          <Link href={o.next ? `/mensalidades?mes=${o.next}` : "#"} aria-disabled={!o.next} className={navBtn} aria-label="Próximo mês"><IconBack className="-scale-x-100" /></Link>
        </div>
      </PageHead>
      <KpiGrid>
        <Kpi tone="dark" label="Recebido" value={brl(o.totals.received)} sub={`${o.counts.pago} alunos pagaram`} />
        <Kpi label="A receber" value={brl(o.totals.pending)} sub={`${o.counts.pendente} dentro do prazo`} />
        <Kpi label="Em atraso" alert value={brl(o.totals.late)} valueClassName="text-red-ink" sub={`${o.counts.atrasado} alunos`} />
        <Kpi label="Alunos em dia" value={`${o.paidPct}%`}>
          <HBar pct={o.paidPct} color="var(--color-gold)" />
        </Kpi>
      </KpiGrid>
      <PaymentsTable key={o.reference} rows={o.rows} counts={o.counts} initialTab={tab} />
    </>
  )
}
