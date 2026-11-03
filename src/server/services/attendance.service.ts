import "server-only"
import { requestToday } from "@/server/request"
import { attendanceRepository } from "@/server/repositories/attendance.repository"
import { classGroupRepository } from "@/server/repositories/catalog.repository"
import { studentRepository } from "@/server/repositories/student.repository"
import { addDays, addMonths, dateOnly, daysBetween, ddmmyyyy, hhmm, MONTHS, monthRef, WEEKDAYS, WEEKDAYS_SHORT } from "@/lib/dates"
import { onlyDigits } from "@/lib/format"
import type { BeltId } from "@/domain/belts"
import { DomainError } from "@/server/errors"
import type { RollCallInput } from "@/lib/validations/attendance"

export type RollCallClass = {
  slug: string
  name: string
  time: string
  students: { id: number; shortName: string; belt: BeltId; stripes: number; present: boolean | null; viaQr: boolean }[]
}

export async function attendanceOverview() {
  const today = await requestToday()
  const classes = await classGroupRepository.list()

  const rollCall: RollCallClass[] = await Promise.all(
    classes.map(async (c) => {
      const marks = new Map((await attendanceRepository.forClassOnDay(c.id, today)).map((a) => [a.studentId, a]))
      return {
        slug: c.slug,
        name: c.name,
        time: c.startTime,
        students: c.students.map((s) => {
          const m = marks.get(s.id)
          return { id: s.id, shortName: s.shortName, belt: s.belt as BeltId, stripes: s.stripes, present: m ? m.present : null, viaQr: m?.source === "qr" && !!m.present }
        }),
      }
    })
  )

  const presences = await attendanceRepository.presentSince(addDays(today, -60))

  // Semana passada (seg–sáb)
  const dow = today.getUTCDay() || 7
  const lastMonday = addDays(today, -dow - 6)
  const week = Array.from({ length: 6 }, (_, i) => {
    const day = addDays(lastMonday, i)
    return { label: WEEKDAYS_SHORT[day.getUTCDay()], value: presences.filter((p) => p.date.getTime() === day.getTime()).length }
  })

  // Alunos sumidos: ativos sem treinar há mais de 10 dias
  const students = (await studentRepository.list()).filter((s) => s.status === "ativo")
  const lastByStudent = new Map<number, Date>()
  for (const p of presences) if (!lastByStudent.has(p.studentId)) lastByStudent.set(p.studentId, p.date)
  const missing = students
    .map((s) => ({ name: s.shortName, days: lastByStudent.has(s.id) ? daysBetween(lastByStudent.get(s.id)!, today) : null }))
    .filter((s) => s.days === null || s.days > 10)
    .sort((a, b) => (b.days ?? 999) - (a.days ?? 999))

  // Mais assíduos no mês anterior
  const prevStart = addMonths(dateOnly(`${monthRef(today)}-01`), -1)
  const prevEnd = addMonths(prevStart, 1)
  const counts = new Map<number, number>()
  for (const p of presences) if (p.date >= prevStart && p.date < prevEnd) counts.set(p.studentId, (counts.get(p.studentId) ?? 0) + 1)
  const names = new Map(students.map((s) => [s.id, s.shortName]))
  const top = [...counts.entries()]
    .filter(([id]) => names.has(id))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, n]) => ({ name: names.get(id)!, count: n }))

  return {
    dateLabel: `${WEEKDAYS[today.getUTCDay()]}, ${ddmmyyyy(today)}`,
    rollCall,
    week,
    missing,
    top,
    topMonth: MONTHS[prevStart.getUTCMonth()].toLowerCase(),
  }
}

export async function saveRollCall(input: RollCallInput) {
  const c = await classGroupRepository.findBySlug(input.classSlug)
  if (!c) throw new DomainError("Turma não encontrada.")
  await attendanceRepository.saveRollCall(c.id, await requestToday(), input.marks)
}

/** Check-in, passo 1: identifica o aluno pelo telefone */
export async function findForCheckin(phone: string) {
  const s = await studentRepository.findByPhone(onlyDigits(phone))
  if (!s || s.status !== "ativo") throw new DomainError("Telefone não encontrado. Fale com o professor.")
  const cls = s.classGroup ?? (await classGroupRepository.findBySlug("noite"))
  return {
    id: s.id,
    shortName: s.shortName,
    belt: s.belt as BeltId,
    stripes: s.stripes,
    className: cls?.name ?? "Aula livre",
    classTime: cls?.startTime ?? "",
  }
}

export type CheckinStudent = Awaited<ReturnType<typeof findForCheckin>>

/** Check-in, passo 2: registra a presença (idempotente no dia) */
export async function confirmCheckin(studentId: number) {
  const s = await studentRepository.findById(studentId)
  if (!s || s.status !== "ativo") throw new DomainError("Aluno não encontrado.")
  const cls = s.classGroup ?? (await classGroupRepository.findBySlug("noite"))
  if (!cls) throw new DomainError("Nenhuma aula disponível agora.")
  const today = await requestToday()

  const existing = await attendanceRepository.findOne(s.id, cls.id, today)
  const already = !!existing?.present && !!existing.checkedInAt
  const record = already ? existing! : await attendanceRepository.checkIn(s.id, cls.id, today, new Date())

  const monthStart = dateOnly(`${monthRef(today)}-01`)
  const month = (await attendanceRepository.presentSince(monthStart)).filter((p) => p.studentId === s.id).length

  return {
    already,
    time: hhmm(record.checkedInAt ?? new Date()),
    firstName: s.shortName.split(" ")[0],
    monthCount: month,
    monthName: MONTHS[today.getUTCMonth()].toLowerCase(),
    belt: s.belt as BeltId,
    stripes: s.stripes,
  }
}

export async function checkinDateLabel() {
  const t = await requestToday()
  return `${WEEKDAYS[t.getUTCDay()]}-feira, ${ddmmyyyy(t)}`.replace("Sábado-feira", "Sábado").replace("Domingo-feira", "Domingo")
}
