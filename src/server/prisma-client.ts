import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@/generated/prisma/client"

export type { PrismaClient }

/** Único ponto que conhece o banco concreto (MySQL via adapter MariaDB). */
export function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!)
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectionLimit: 5,
  })
  return new PrismaClient({ adapter })
}
