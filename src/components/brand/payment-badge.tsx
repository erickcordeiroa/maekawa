import { Badge } from "@/components/ui/badge"
import type { PaymentStatus } from "@/domain/payments"

const VARIANT = { pago: "paid", pendente: "pending", atrasado: "late" } as const

export function PaymentBadge({ status, label }: { status: PaymentStatus; label: string }) {
  return <Badge variant={VARIANT[status]}>{label}</Badge>
}
