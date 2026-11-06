import "server-only"
import { requestToday } from "@/server/request"
import { paymentRepository } from "@/server/repositories/payment.repository"
import { studentRepository } from "@/server/repositories/student.repository"
import { addMonths, ddmm, monthLabel, monthRef, parseMonthRef } from "@/lib/dates"
import { dueDateIn, paymentStatus, type PaymentStatus } from "@/domain/payments"
import { paymentBadge, type PaymentBadge } from "./view-helpers"
import { DomainError } from "@/server/errors"

export type PaymentRow = {
  id: number
  studentName: string
  plan: string
  amountCents: number
  due: string
  status: PaymentStatus
  badge: PaymentBadge
}

/**
 * Cria a mensalidade do mês atual de quem é ativo e ainda não tem, com o valor atual do plano
 * e o dia de vencimento do cadastro. Roda nas leituras do painel: na virada do mês, o primeiro
 * acesso gera tudo, e um aluno confirmado ou reativado entra no acesso seguinte.
 */
export async function ensureCurrentMonthPayments(today: Date) {
  const reference = monthRef(today)
  const students = await studentRepository.listActiveWithoutPayment(reference)
  if (students.length === 0) return
  await paymentRepository.createMany(
    students.map((s) => ({
      studentId: s.id,
      reference,
      amountCents: s.plan.priceCents,
      dueDate: dueDateIn(today, s.dueDay),
    })),
  )
}

export async function monthOverview(ref?: string) {
  const today = await requestToday()
  await ensureCurrentMonthPayments(today)
  const month = parseMonthRef(ref, today)
  const reference = monthRef(month)
  const payments = await paymentRepository.listForMonth(reference)

  const rows: PaymentRow[] = payments.map((p) => ({
    id: p.id,
    studentName: p.student.shortName,
    plan: p.student.plan.name,
    amountCents: p.amountCents,
    due: ddmm(p.dueDate),
    status: paymentStatus(p, today),
    badge: paymentBadge(p, today),
  }))

  const sum = (s: PaymentStatus) => rows.filter((r) => r.status === s).reduce((a, r) => a + r.amountCents, 0)
  const count = (s: PaymentStatus) => rows.filter((r) => r.status === s).length
  const currentRef = monthRef(today)

  return {
    reference,
    label: monthLabel(month),
    prev: monthRef(addMonths(month, -1)),
    next: reference < currentRef ? monthRef(addMonths(month, 1)) : null,
    rows,
    totals: { received: sum("pago"), pending: sum("pendente"), late: sum("atrasado") },
    counts: { todos: rows.length, pago: count("pago"), pendente: count("pendente"), atrasado: count("atrasado") },
    paidPct: rows.length ? Math.round((count("pago") / rows.length) * 100) : 0,
  }
}

export async function markPaid(id: number) {
  const p = await paymentRepository.findById(id)
  if (!p) throw new DomainError("Mensalidade não encontrada.")
  const updated = await paymentRepository.setPaidAt(id, await requestToday())
  return updated.student.shortName
}

export async function undoPayment(id: number) {
  const p = await paymentRepository.findById(id)
  if (!p) throw new DomainError("Mensalidade não encontrada.")
  await paymentRepository.setPaidAt(id, null)
  return p.student.shortName
}

/** Texto pronto para cobrança no WhatsApp */
export async function chargeMessage(id: number) {
  const p = await paymentRepository.findById(id)
  if (!p) throw new DomainError("Mensalidade não encontrada.")
  const text = `Oss, ${p.student.shortName.split(" ")[0]}! Sua mensalidade venceu em ${ddmm(p.dueDate)}. Quando puder, regularize com a recepção. Obrigado!`
  // Menor: quem paga é o responsável, então a cobrança vai para o contato dele
  const phone = p.student.guardianPhone || p.student.phone
  if (!phone) throw new DomainError(`${p.student.shortName} não tem telefone cadastrado.`)
  return { name: p.student.shortName, url: `https://wa.me/55${phone}?text=${encodeURIComponent(text)}` }
}
