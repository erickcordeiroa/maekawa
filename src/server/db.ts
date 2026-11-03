import "server-only"
import { createPrismaClient, type PrismaClient } from "./prisma-client"

// Singleton: evita abrir uma conexão nova a cada hot reload em dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
