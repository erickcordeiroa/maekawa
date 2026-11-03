import { ddmm } from "@/lib/dates"
import { paymentStatus, type PaymentStatus } from "@/domain/payments"

export type PaymentBadge = { status: PaymentStatus; label: string }

export function paymentBadge(p: { paidAt: Date | null; dueDate: Date }, today: Date): PaymentBadge {
  const status = paymentStatus(p, today)
  if (status === "pago") return { status, label: `Pago em ${ddmm(p.paidAt!)}` }
  if (status === "pendente") return { status, label: `Pendente · vence ${ddmm(p.dueDate)}` }
  return { status, label: `Atrasada desde ${ddmm(p.dueDate)}` }
}

/** A mensalidade que define a situação do aluno: a mais antiga em aberto ou, se tudo pago, a mais recente */
export function currentPayment<T extends { paidAt: Date | null; reference: string }>(payments: T[]): T | null {
  return payments.find((p) => !p.paidAt) ?? payments.at(-1) ?? null
}
