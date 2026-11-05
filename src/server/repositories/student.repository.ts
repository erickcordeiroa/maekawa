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

  /** Todos os alunos ativos ligados ao número: como telefone próprio ou como contato do responsável */
  listActiveByPhone(phone: string) {
    return db.student.findMany({
      where: { status: "ativo", OR: [{ phone }, { guardianPhone: phone }] },
      include: { classGroup: true },
      orderBy: { birthDate: "asc" },
    })
  },

  /** Mesma pessoa matriculada duas vezes (vale para quem não tem CPF, como as crianças) */
  findByNameAndBirth(fullName: string, birthDate: Date) {
    return db.student.findFirst({ where: { fullName, birthDate }, select: { id: true, shortName: true } })
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

  /**
   * Tira um grau: atualiza o aluno e corrige o histórico na mesma transação.
   * "delete" apaga o registro do grau; "correct" ajusta os graus do registro de início.
   */
  removeStripe(id: number, stripes: number, history: { graduationId: number; mode: "delete" | "correct" }) {
    return db.$transaction([
      db.student.update({ where: { id }, data: { stripes } }),
      history.mode === "delete"
        ? db.graduation.delete({ where: { id: history.graduationId } })
        : db.graduation.update({ where: { id: history.graduationId }, data: { stripes } }),
    ])
  },
}
