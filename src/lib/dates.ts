// Convenção: datas "de calendário" são gravadas como meia-noite UTC do dia local
// (America/Sao_Paulo). Assim o mesmo valor funciona em SQLite e MySQL sem fuso.
export const TZ = "America/Sao_Paulo"

const pad = (n: number) => String(n).padStart(2, "0")

/** "2026-11-03" no fuso da academia */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now)
}

export const dateOnly = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
export const today = () => dateOnly(todayISO())

export const toISO = (d: Date) => d.toISOString().slice(0, 10)

export function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setUTCDate(r.getUTCDate() + n)
  return r
}

export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000)

/** 03/11 */
export const ddmm = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`
/** 03/11/2026 */
export const ddmmyyyy = (d: Date) => `${ddmm(d)}/${d.getUTCFullYear()}`

/** Hora local "19:00" de um instante real */
export const hhmm = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d)

export const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3))
export const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

/** "2026-11" */
export const monthRef = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`

export function parseMonthRef(ref: string | undefined, fallback: Date): Date {
  if (ref && /^\d{4}-\d{2}$/.test(ref)) return dateOnly(`${ref}-01`)
  return dateOnly(`${monthRef(fallback)}-01`)
}

export function addMonths(d: Date, n: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))
}

export const monthLabel = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`

export function ageOn(birth: Date, on: Date) {
  let age = on.getUTCFullYear() - birth.getUTCFullYear()
  const m = on.getUTCMonth() - birth.getUTCMonth()
  if (m < 0 || (m === 0 && on.getUTCDate() < birth.getUTCDate())) age--
  return age
}

/** "Hoje, 19:00" · "Ontem, 07:00" · "12 dias atrás" · "30/10, 19:00" */
export function relativeDay(day: Date, time: string | null, ref: Date) {
  const diff = daysBetween(day, ref)
  const t = time ? `, ${time}` : ""
  if (diff === 0) return `Hoje${t}`
  if (diff === 1) return `Ontem${t}`
  if (diff >= 10) return `${diff} dias atrás`
  return `${ddmm(day)}${t}`
}
