import "server-only"
import { db } from "@/server/db"

export const paymentRepository = {
  /** Mensalidades do mês + as em aberto de meses anteriores */
  listForMonth(reference: string) {
    return db.payment.findMany({
      where: { OR: [{ reference }, { reference: { lt: reference }, paidAt: null }] },
      include: { student: { include: { plan: true } } },
      orderBy: [{ student: { shortName: "asc" } }],
    })
  },

  /** skipDuplicates: dois acessos simultâneos não geram erro nem cobrança em dobro */
  createMany(data: { studentId: number; reference: string; amountCents: number; dueDate: Date }[]) {
    return db.payment.createMany({ data, skipDuplicates: true })
  },

  findById(id: number) {
    return db.payment.findUnique({ where: { id }, include: { student: true } })
  },

  setPaidAt(id: number, paidAt: Date | null) {
    return db.payment.update({ where: { id }, data: { paidAt }, include: { student: true } })
  },
}
