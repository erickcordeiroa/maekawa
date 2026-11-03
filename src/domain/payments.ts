export type PaymentStatus = "pago" | "pendente" | "atrasado"

export function paymentStatus(p: { paidAt: Date | null; dueDate: Date }, today: Date): PaymentStatus {
  if (p.paidAt) return "pago"
  return p.dueDate < today ? "atrasado" : "pendente"
}

export const PAYMENT_TABS = [
  ["todos", "Todos"],
  ["pago", "Pagos"],
  ["pendente", "Pendentes"],
  ["atrasado", "Atrasados"],
] as const
export type PaymentTab = (typeof PAYMENT_TABS)[number][0]
