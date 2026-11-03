import "server-only"
import { db } from "@/server/db"
import type { Prisma } from "@/generated/prisma/client"

export const transactionRepository = {
  inRange(from: Date, toExclusive: Date) {
    return db.transaction.findMany({ where: { date: { gte: from, lt: toExclusive } } })
  },

  recent(take: number) {
    return db.transaction.findMany({ orderBy: [{ date: "desc" }, { id: "desc" }], take })
  },

  create(data: Prisma.TransactionCreateInput) {
    return db.transaction.create({ data })
  },
}
