import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "@/generated/prisma/client"

export type { PrismaClient }

/**
 * Único ponto que conhece o banco concreto.
 *
 * Para migrar para MySQL:
 *   1. npm i @prisma/adapter-mariadb
 *   2. schema.prisma → provider = "mysql"
 *   3. aqui: `new PrismaMariaDb(process.env.DATABASE_URL!)` no lugar do adapter SQLite
 *   4. npx prisma migrate dev
 * Repositórios, serviços e telas não mudam.
 */
export function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" })
  return new PrismaClient({ adapter })
}
