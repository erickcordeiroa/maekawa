import { ADULT_ORDER, KIDS_ORDER, graduationLabel, maxStripes, type BeltId } from "./belts"

/**
 * Histórico de graduações lançado a partir do caderno do professor.
 * Regras puras, usadas na tela (validação ao digitar) e no servidor (validação final).
 * Datas sempre no formato "AAAA-MM-DD" (data de calendário, sem fuso), então comparar texto = comparar datas.
 */

export type HistoryStep = { kind: "inicio" | "promocao" | "grau"; belt: BeltId; stripes: number }

/** Faixas em que o aluno pode ter começado: da primeira da trilha até a faixa atual */
export function startBeltOptions(current: BeltId, isKids: boolean): BeltId[] {
  const order = isKids ? KIDS_ORDER : ADULT_ORDER
  const i = order.indexOf(current)
  return i < 0 ? [current] : order.slice(0, i + 1)
}

/** Todos os passos, em ordem, do início na faixa `start` até a faixa e os graus atuais */
export function historyPath(start: BeltId, current: BeltId, currentStripes: number, isKids: boolean): HistoryStep[] {
  const options = startBeltOptions(current, isKids)
  const from = options.indexOf(start)
  if (from < 0) return []
  const steps: HistoryStep[] = []
  for (const belt of options.slice(from)) {
    steps.push({ kind: belt === start ? "inicio" : "promocao", belt, stripes: 0 })
    const last = belt === current ? currentStripes : maxStripes(belt)
    for (let s = 1; s <= last; s++) steps.push({ kind: "grau", belt, stripes: s })
  }
  return steps
}

export const stepLabel = (s: HistoryStep) => graduationLabel(s.kind, s.belt, s.stripes)

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
/** "2026-02-31" e anos com mais de 4 dígitos não passam */
function isRealDate(iso: string) {
  if (!ISO_DATE.test(iso)) return false
  const d = new Date(`${iso}T00:00:00.000Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso
}
const br = (iso: string) => iso.split("-").reverse().join("/")

export type DateLimits = { birthISO: string; todayISO: string }

/** Erro de uma data isolada (formato, futuro, antes do nascimento) ou null */
export function singleDateError(iso: string, { birthISO, todayISO }: DateLimits): string | null {
  if (!isRealDate(iso)) return "Data inválida. Use dia, mês e ano com 4 dígitos."
  if (iso > todayISO) return "A data não pode estar no futuro."
  if (iso < birthISO) return `A data é anterior ao nascimento do aluno (${br(birthISO)}).`
  return null
}

/**
 * Erro de cada passo, na mesma posição de `dates` ("" = passo sem data, fica fora do histórico).
 * Datas iguais são aceitas (dois graus no mesmo dia); só não pode voltar no tempo.
 */
export function historyDateErrors(steps: HistoryStep[], dates: string[], limits: DateLimits): (string | null)[] {
  let prev: { date: string; step: HistoryStep } | null = null
  return steps.map((step, i) => {
    const date = dates[i] ?? ""
    if (!date) return null
    const err = singleDateError(date, limits)
    if (err) return err
    if (prev && date < prev.date) return `Fica antes de “${stepLabel(prev.step)}” (${br(prev.date)}). Confira a ordem das datas.`
    prev = { date, step }
    return null
  })
}

/** Data de um lançamento já existente: entre o lançamento anterior e o seguinte */
export function moveDateError(
  iso: string,
  neighbors: { prev?: { label: string; dateISO: string }; next?: { label: string; dateISO: string } },
  limits: DateLimits,
): string | null {
  const err = singleDateError(iso, limits)
  if (err) return err
  if (neighbors.prev && iso < neighbors.prev.dateISO) return `Fica antes de “${neighbors.prev.label}” (${br(neighbors.prev.dateISO)}).`
  if (neighbors.next && iso > neighbors.next.dateISO) return `Fica depois de “${neighbors.next.label}” (${br(neighbors.next.dateISO)}).`
  return null
}
