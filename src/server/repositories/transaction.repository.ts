import "server-only"
import { db } from "@/server/db"
import type { Prisma } from "@/generated/prisma/client"

export const transactionRepository = {
  inRange(from: Date, toExclusive: Date) {
    return db.transaction.findMany({
      where: { date: { gte: from, lt: toExclusive } },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    })
  },

  create(data: Prisma.TransactionCreateInput) {
    return db.transaction.create({ data })
  },
}
