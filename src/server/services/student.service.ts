import "server-only"
import { requestToday } from "@/server/request"
import { DomainError } from "@/server/errors"
import { studentRepository, type StudentDetailRecord } from "@/server/repositories/student.repository"
import { attendanceRepository } from "@/server/repositories/attendance.repository"
import { classGroupRepository, planRepository } from "@/server/repositories/catalog.repository"
import { addDays, ageOn, dateOnly, ddmmyyyy, hhmm, instantDate, MONTHS, monthRef, relativeDay, toISO } from "@/lib/dates"
import { onlyDigits, formatPhone } from "@/lib/format"
import { graduationLabel, maxStripes, nextBelt, type BeltId } from "@/domain/belts"
import { currentPayment, paymentBadge, type PaymentBadge } from "./view-helpers"
import { TERM_VERSION, type TermSignerRole } from "@/domain/term"
import { maskCpf } from "@/domain/cpf"
import type { EnrollmentInput } from "@/lib/validations/enrollment"
import { STUDENT_STATUSES, type StudentEditFormValues, type StudentEditInput } from "@/lib/validations/student"


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
  inactive: boolean
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
      inactive: s.status === "inativo",
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
    cpf: s.cpf ? maskCpf(s.cpf) : null,
    address: s.address,
    guardian: s.guardianName
      ? { name: s.guardianName, phone: formatPhone(s.guardianPhone ?? ""), cpf: s.guardianCpf ? maskCpf(s.guardianCpf) : null }
      : null,
    pending: s.status === "pendente",
    inactive: s.status === "inativo",
    approval: s.approvedAt ? { at: instantDate(s.approvedAt), by: s.approvedBy?.name ?? "Equipe da academia" } : null,
    term: termView(s.terms[0]),
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

function termView(t: StudentDetailRecord["terms"][number] | undefined) {
  if (!t) return null
  return {
    version: t.version,
    current: t.version === TERM_VERSION,
    signerRole: t.signerRole as TermSignerRole,
    signerName: t.signerName,
    signerCpf: maskCpf(t.signerCpf),
    acceptedAt: `${instantDate(t.acceptedAt)} às ${hhmm(t.acceptedAt)}`,
    ip: t.ip,
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

export type RequestMeta = { ip: string | null; userAgent: string | null }

/** Ficha pública de matrícula: entra como "pendente" até a equipe confirmar */
export async function registerEnrollment(input: EnrollmentInput, meta: RequestMeta) {
  const phone = onlyDigits(input.phone)
  if (await studentRepository.findByPhone(phone)) throw new DomainError("Este telefone já está cadastrado. Fale com a recepção.")
  if (input.cpf && (await studentRepository.findByCpf(input.cpf))) throw new DomainError("Este CPF já está cadastrado. Fale com a recepção.")
  const plan = await planRepository.findById(input.planId)
  if (!plan || !plan.active) throw new DomainError("Este plano não está mais disponível. Escolha outro plano.")
  const isKids = plan.isKids
  const kidsClass = isKids ? await classGroupRepository.findBySlug("kids") : null
  const names = input.fullName.trim().split(/\s+/)
  const today = await requestToday()
  // Quem aceita o termo: o próprio aluno adulto ou o responsável legal do menor
  const signer: { signerRole: TermSignerRole; signerName: string; signerCpf: string } = input.isMinor
    ? { signerRole: "responsavel", signerName: input.guardianName!.trim(), signerCpf: input.guardianCpf! }
    : { signerRole: "aluno", signerName: input.fullName.trim(), signerCpf: input.cpf! }

  await studentRepository.create({
    fullName: input.fullName.trim(),
    shortName: names.length > 1 ? `${names[0]} ${names[1]}` : names[0],
    phone,
    cpf: input.cpf,
    birthDate: dateOnly(input.birthDate),
    address: input.address.trim(),
    guardianName: input.guardianName?.trim() ?? null,
    guardianPhone: input.guardianPhone,
    guardianCpf: input.guardianCpf,
    belt: input.belt,
    stripes: input.stripes,
    isKids,
    status: "pendente",
    dueDay: input.dueDay,
    memberSince: today,
    planId: plan.id,
    classGroupId: kidsClass?.id ?? null,
    graduations: { create: { kind: "inicio", belt: input.belt, stripes: input.stripes, date: today } },
    terms: { create: { version: TERM_VERSION, ...signer, ip: meta.ip?.slice(0, 64) ?? null, userAgent: meta.userAgent?.slice(0, 500) ?? null } },
  })
}

/** A academia confirma a matrícula: registra quem aprovou e quando (o "representante da academia") */
export async function confirmEnrollment(id: number, userId: number) {
  const s = await studentRepository.findById(id)
  if (!s) throw new DomainError("Aluno não encontrado.")
  if (s.status !== "pendente") throw new DomainError("Esta matrícula já foi confirmada.")
  await studentRepository.approve(id, userId)
  return `Matrícula de ${s.shortName} confirmada. Oss!`
}

export async function listPlans() {
  await requestToday() // marca a leitura como "por requisição"
  return planRepository.listActive()
}

/** Dados atuais do aluno no formato do formulário de edição, com as opções de plano e turma */
export async function getStudentForEdit(id: number) {
  const s = await studentRepository.findById(id)
  if (!s) return null
  const [plans, classGroups] = await Promise.all([planRepository.listWithCounts(), classGroupRepository.listBasic()])
  const values: StudentEditFormValues = {
    id: s.id,
    fullName: s.fullName,
    shortName: s.shortName,
    birthDate: toISO(s.birthDate),
    phone: formatPhone(s.phone),
    cpf: s.cpf ? maskCpf(s.cpf) : "",
    address: s.address,
    isMinor: !!s.guardianName,
    guardianName: s.guardianName ?? "",
    guardianPhone: s.guardianPhone ? formatPhone(s.guardianPhone) : "",
    guardianCpf: s.guardianCpf ? maskCpf(s.guardianCpf) : "",
    planId: String(s.planId),
    classGroupId: s.classGroupId ? String(s.classGroupId) : "",
    dueDay: String(s.dueDay) as StudentEditFormValues["dueDay"],
    status: (STUDENT_STATUSES as readonly string[]).includes(s.status) ? (s.status as StudentEditFormValues["status"]) : "ativo",
  }
  return {
    values,
    // Planos inativos só aparecem se forem o plano atual do aluno
    plans: plans.filter((p) => p.active || p.id === s.planId).map((p) => ({ id: p.id, name: p.active ? p.name : `${p.name} (inativo)` })),
    classGroups: classGroups.map((c) => ({ id: c.id, name: `${c.name} · ${c.startTime}` })),
  }
}

export type StudentEditData = NonNullable<Awaited<ReturnType<typeof getStudentForEdit>>>

/** Edição pelo administrador: pode alterar todos os dados cadastrais */
export async function updateStudent(input: StudentEditInput, userId: number) {
  const s = await studentRepository.findById(input.id)
  if (!s) throw new DomainError("Aluno não encontrado.")
  const phone = onlyDigits(input.phone)
  const byPhone = await studentRepository.findByPhone(phone)
  if (byPhone && byPhone.id !== s.id) throw new DomainError(`Este telefone já é de outro aluno (${byPhone.shortName}).`)
  if (input.cpf) {
    const byCpf = await studentRepository.findByCpf(input.cpf)
    if (byCpf && byCpf.id !== s.id) throw new DomainError("Este CPF já é de outro aluno.")
  }
  const plan = await planRepository.findById(input.planId)
  if (!plan || (!plan.active && plan.id !== s.planId)) throw new DomainError("Escolha um plano ativo.")
  if (input.classGroupId && !(await classGroupRepository.findById(input.classGroupId))) throw new DomainError("Turma inválida.")

  // Confirmar a matrícula por aqui também registra quem aprovou
  const approving = s.status === "pendente" && input.status === "ativo"
  await studentRepository.update(s.id, {
    fullName: input.fullName.trim(),
    shortName: input.shortName.trim(),
    birthDate: dateOnly(input.birthDate),
    phone,
    cpf: input.cpf,
    address: input.address.trim(),
    guardianName: input.guardianName?.trim() ?? null,
    guardianPhone: input.guardianPhone,
    guardianCpf: input.guardianCpf,
    planId: plan.id,
    isKids: plan.isKids,
    classGroupId: input.classGroupId,
    dueDay: input.dueDay,
    status: input.status,
    ...(approving ? { approvedAt: new Date(), approvedById: userId } : {}),
  })
  if (s.status !== "inativo" && input.status === "inativo") return `${input.shortName.trim()} foi desativado. Ele some da lista e do check-in; o histórico fica guardado.`
  if (s.status === "inativo" && input.status !== "inativo") return `${input.shortName.trim()} foi reativado`
  return `Dados de ${input.shortName.trim()} atualizados`
}
