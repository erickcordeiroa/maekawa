import "server-only"
import { requestToday } from "@/server/request"
import { DomainError } from "@/server/errors"
import { studentRepository } from "@/server/repositories/student.repository"
import { attendanceRepository } from "@/server/repositories/attendance.repository"
import { classGroupRepository, planRepository } from "@/server/repositories/catalog.repository"
import { addDays, ageOn, dateOnly, ddmmyyyy, hhmm, MONTHS, monthRef, relativeDay } from "@/lib/dates"
import { onlyDigits, formatPhone } from "@/lib/format"
import { graduationLabel, maxStripes, nextBelt, type BeltId } from "@/domain/belts"
import { currentPayment, paymentBadge, type PaymentBadge } from "./view-helpers"
import type { EnrollmentInput } from "@/lib/validations/enrollment"


type Presence = Awaited<ReturnType<typeof attendanceRepository.presentSince>>[number]

/** Última presença e contagem no mês por aluno, a partir de uma única consulta */
async function presenceIndex(today: Date) {
  const monthStart = dateOnly(`${monthRef(today)}-01`)
  const rows = await attendanceRepository.presentSince(addDays(today, -120))
  const last = new Map<number, Presence>()
  const month = new Map<number, number>()
  for (const r of rows) {
    if (!last.has(r.studentId)) last.set(r.studentId, r)
    if (r.date >= monthStart) month.set(r.studentId, (month.get(r.studentId) ?? 0) + 1)
  }
  const lastLabel = (id: number) => {
    const r = last.get(id)
    if (!r) return "Sem presença"
    const time = r.source === "qr" && r.checkedInAt ? hhmm(r.checkedInAt) : r.classGroup.startTime
    return relativeDay(r.date, time, today)
  }
  return { last, month, lastLabel }
}

export type StudentRow = {
  id: number
  shortName: string
  plan: string
  turma: string
  belt: BeltId
  stripes: number
  isKids: boolean
  phone: string
  pending: boolean
  payment: PaymentBadge | null
  lastPresence: string
}

export async function listStudents() {
  const today = await requestToday()
  const [students, presence] = await Promise.all([studentRepository.list(), presenceIndex(today)])
  const monthStart = dateOnly(`${monthRef(today)}-01`)

  const rows: StudentRow[] = students.map((s) => {
    const p = currentPayment(s.payments)
    return {
      id: s.id,
      shortName: s.shortName,
      plan: s.plan.name,
      turma: s.classGroup?.name ?? "Sem turma",
      belt: s.belt as BeltId,
      stripes: s.stripes,
      isKids: s.isKids,
      phone: formatPhone(s.phone),
      pending: s.status === "pendente",
      payment: p ? paymentBadge(p, today) : null,
      lastPresence: presence.lastLabel(s.id),
    }
  })

  const active = students.filter((s) => s.status === "ativo")
  return {
    rows,
    kpis: {
      active: active.length,
      newThisMonth: students.filter((s) => s.memberSince >= monthStart).length,
      kids: active.filter((s) => s.isKids).length,
      late: rows.filter((r) => r.payment?.status === "atrasado").length,
    },
  }
}

export async function getStudentDetail(id: number) {
  const s = await studentRepository.findById(id)
  if (!s) return null
  const today = await requestToday()
  const presence = await presenceIndex(today)
  const p = currentPayment(s.payments)
  const max = maxStripes(s.belt)
  const next = nextBelt(s.belt, s.isKids)

  return {
    id: s.id,
    fullName: s.fullName,
    shortName: s.shortName,
    belt: s.belt as BeltId,
    stripes: s.stripes,
    plan: s.plan.name,
    turma: s.classGroup?.name ?? "Sem turma",
    since: ddmmyyyy(s.memberSince),
    birth: ddmmyyyy(s.birthDate),
    age: ageOn(s.birthDate, today),
    phone: formatPhone(s.phone),
    address: s.address,
    guardian: s.guardianName ? { name: s.guardianName, phone: formatPhone(s.guardianPhone ?? "") } : null,
    monthPresences: presence.month.get(s.id) ?? 0,
    payment: p ? paymentBadge(p, today) : null,
    paymentMonth: MONTHS[today.getUTCMonth()].toLowerCase(),
    canAddStripe: s.stripes < max,
    nextBelt: next,
    history: s.graduations.map((g) => ({
      id: g.id,
      label: graduationLabel(g.kind, g.belt, g.stripes),
      date: ddmmyyyy(g.date),
      belt: g.belt as BeltId,
    })),
  }
}

export type StudentDetail = NonNullable<Awaited<ReturnType<typeof getStudentDetail>>>

export async function addStripe(id: number, dateISO: string) {
  const s = await studentRepository.findById(id)
  if (!s) throw new DomainError("Aluno não encontrado.")
  if (s.stripes >= maxStripes(s.belt)) throw new DomainError("Grau máximo atingido nesta faixa. O próximo passo é a promoção.")
  const stripes = s.stripes + 1
  await studentRepository.graduate(id, { belt: s.belt, stripes, kind: "grau", date: dateOnly(dateISO) })
  return `${stripes}º grau registrado para ${s.shortName}`
}

export async function promote(id: number, dateISO: string) {
  const s = await studentRepository.findById(id)
  if (!s) throw new DomainError("Aluno não encontrado.")
  const nb = nextBelt(s.belt, s.isKids)
  if (!nb) throw new DomainError("Não há próxima faixa para este aluno.")
  await studentRepository.graduate(id, { belt: nb, stripes: 0, kind: "promocao", date: dateOnly(dateISO) })
  return { name: s.shortName, belt: nb }
}

/** Ficha pública de matrícula: entra como "pendente" até a equipe confirmar */
export async function registerEnrollment(input: EnrollmentInput) {
  const phone = onlyDigits(input.phone)
  if (await studentRepository.findByPhone(phone)) throw new DomainError("Este telefone já está cadastrado. Fale com a recepção.")
  const plan = await planRepository.findByName(input.plan)
  if (!plan) throw new DomainError("Plano inválido.")
  const isKids = input.plan === "Kids"
  const kidsClass = isKids ? await classGroupRepository.findBySlug("kids") : null
  const names = input.fullName.trim().split(/\s+/)
  const today = await requestToday()

  await studentRepository.create({
    fullName: input.fullName.trim(),
    shortName: names.length > 1 ? `${names[0]} ${names[1]}` : names[0],
    phone,
    birthDate: dateOnly(input.birthDate),
    address: input.address.trim(),
    guardianName: input.isMinor ? input.guardianName?.trim() : null,
    guardianPhone: input.isMinor ? onlyDigits(input.guardianPhone ?? "") : null,
    belt: input.belt,
    stripes: input.stripes,
    isKids,
    status: "pendente",
    dueDay: input.dueDay,
    memberSince: today,
    planId: plan.id,
    classGroupId: kidsClass?.id ?? null,
    graduations: { create: { kind: "inicio", belt: input.belt, stripes: input.stripes, date: today } },
  })
}

export async function listPlans() {
  await requestToday() // marca a leitura como "por requisição"
  return planRepository.list()
}
