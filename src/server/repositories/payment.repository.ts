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

  /** Marca como paga e lança a entrada no Financeiro na mesma operação (upsert: clicar duas vezes não duplica) */
  markPaid(id: number, paidAt: Date, entry: { description: string; amountCents: number }) {
    const transaction = { date: paidAt, kind: "entrada", category: "Mensalidades", ...entry }
    return db.payment.update({
      where: { id },
      data: { paidAt, transaction: { upsert: { create: transaction, update: transaction } } },
      include: { student: true },
    })
  },

  /** Desfaz o pagamento e retira a entrada correspondente do Financeiro */
  undoPaid(id: number) {
    return db.$transaction([
      db.transaction.deleteMany({ where: { paymentId: id } }),
      db.payment.update({ where: { id }, data: { paidAt: null } }),
    ])
  },
}
