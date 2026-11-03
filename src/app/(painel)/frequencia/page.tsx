import type { Metadata } from "next"
import Link from "next/link"
import { attendanceOverview } from "@/server/services/attendance.service"
import { checkinQrSvg } from "@/server/services/qr.service"
import { PageHead } from "@/components/brand/page-head"
import { Card, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { RollCall } from "./roll-call"
import { QrPosterButton, QrImage } from "./qr-poster"

export const metadata: Metadata = { title: "Frequência" }

export default async function FrequenciaPage() {
  const [o, qr] = await Promise.all([attendanceOverview(), checkinQrSvg()])
  const max = Math.max(1, ...o.week.map((w) => w.value))

  return (
    <>
      <PageHead title="Frequência" description="Chamada das aulas de hoje e acompanhamento do mês.">
        <span className="display rounded-lg bg-white px-4 py-3 text-lg">{o.dateLabel}</span>
      </PageHead>
      <div className="flex flex-wrap items-start gap-6">
        <RollCall classes={o.rollCall} />

        <div className="flex min-w-0 flex-[2_1_320px] flex-col gap-6">
          <Card tone="dark" className="flex flex-wrap items-center gap-[18px]">
            <div className="shrink-0 rounded-lg bg-white p-2">
              <QrImage svg={qr} size={96} />
            </div>
            <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-2">
              <CardTitle className="text-gold">Check-in por QR code</CardTitle>
              <p className="text-sm leading-normal text-on-dark">O aluno escaneia, digita o telefone e a presença entra na chamada sozinha.</p>
              <div className="flex flex-wrap gap-2">
                <QrPosterButton svg={qr} />
                <Link href="/checkin" className={buttonVariants({ variant: "ghost-dark", size: "sm" })}>Testar check-in</Link>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <CardTitle>Presenças por dia (semana passada)</CardTitle>
            <div className="flex h-[180px] items-end gap-3 border-b-2 border-ink px-1" role="img" aria-label={o.week.map((w) => `${w.label} ${w.value}`).join(", ")}>
              {o.week.map((w) => {
                const top = w.value === max && w.value > 0
                return (
                  <div key={w.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <b className="tabular text-[13px]">{w.value}</b>
                    <span className={top ? "w-full max-w-11 border border-gold-deep bg-gold" : "w-full max-w-11 bg-ink"} style={{ height: Math.round((w.value / max) * 130) }} />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 px-1">
              {o.week.map((w) => <span key={w.label} className="flex-1 text-center text-[13px] text-ink-muted">{w.label}</span>)}
            </div>
          </Card>

          <Card alert className="flex flex-col gap-3">
            <CardTitle>Alunos sumidos</CardTitle>
            <p className="text-sm text-ink-muted">Sem treinar há mais de 10 dias. Vale um contato.</p>
            {o.missing.length ? (
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {o.missing.map((m) => (
                  <li key={m.name} className="flex justify-between">
                    <span className="font-semibold">{m.name}</span>
                    <b className="text-sm text-red-ink">{m.days === null ? "Nunca treinou" : `${m.days} dias`}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-semibold">Todo mundo treinou nos últimos 10 dias. Oss!</p>
            )}
          </Card>

          <Card tone="dark" className="flex flex-col gap-3">
            <CardTitle className="text-gold">Mais assíduos em {o.topMonth}</CardTitle>
            {o.top.length ? (
              <ol className="m-0 flex list-decimal flex-col gap-2 pl-5">
                {o.top.map((t) => (
                  <li key={t.name}>
                    <span className="flex justify-between"><span>{t.name}</span><b>{t.count} treinos</b></span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-on-dark">Sem presenças registradas em {o.topMonth}.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
