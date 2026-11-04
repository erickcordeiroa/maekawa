import "server-only"
import { db } from "@/server/db"
import type { Prisma } from "@/generated/prisma/client"

const listInclude = {
  plan: true,
  classGroup: true,
  payments: { orderBy: { reference: "asc" } },
} satisfies Prisma.StudentInclude

const detailInclude = {
  ...listInclude,
  graduations: { orderBy: [{ date: "desc" }, { id: "desc" }] },
  terms: { orderBy: { acceptedAt: "desc" }, take: 1 },
  approvedBy: { select: { name: true } },
} satisfies Prisma.StudentInclude

export type StudentWithRelations = Prisma.StudentGetPayload<{ include: typeof listInclude }>
export type StudentDetailRecord = Prisma.StudentGetPayload<{ include: typeof detailInclude }>

export const studentRepository = {
  list(): Promise<StudentWithRelations[]> {
    return db.student.findMany({ include: listInclude, orderBy: { id: "asc" } })
  },

  findById(id: number): Promise<StudentDetailRecord | null> {
    return db.student.findUnique({ where: { id }, include: detailInclude })
  },

  findByPhone(phone: string) {
    return db.student.findUnique({ where: { phone }, include: { classGroup: true } })
  },

  findByCpf(cpf: string) {
    return db.student.findUnique({ where: { cpf }, select: { id: true } })
  },

  update(id: number, data: Prisma.StudentUncheckedUpdateInput) {
    return db.student.update({ where: { id }, data })
  },

  approve(id: number, userId: number) {
    return db.student.update({ where: { id }, data: { status: "ativo", approvedAt: new Date(), approvedById: userId } })
  },

  countCreatedSince(date: Date) {
    return db.student.count({ where: { memberSince: { gte: date } } })
  },

  create(data: Prisma.StudentUncheckedCreateInput) {
    return db.student.create({ data })
  },

  /** Atualiza faixa/graus e registra no histórico na mesma transação */
  graduate(id: number, data: { belt: string; stripes: number; kind: string; date: Date }) {
    return db.$transaction([
      db.student.update({ where: { id }, data: { belt: data.belt, stripes: data.stripes } }),
      db.graduation.create({ data: { studentId: id, ...data } }),
    ])
  },
}
