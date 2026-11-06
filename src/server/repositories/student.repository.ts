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

  /** Alunos ativos que ainda não têm mensalidade no mês, com o valor atual do plano */
  listActiveWithoutPayment(reference: string) {
    return db.student.findMany({
      where: { status: "ativo", payments: { none: { reference } } },
      select: { id: true, dueDay: true, plan: { select: { priceCents: true } } },
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
   * Correção de faixa/graus, na mesma transação:
   * - `undo`: a faixa já existiu no histórico, então os registros lançados depois dela são apagados;
   * - `record`: faixa nova (ex.: erro no cadastro), fica registrada como "correcao".
   */
  correctBelt(
    id: number,
    data: { belt: string; stripes: number },
    history: { undo: number[] } | { record: Date },
  ) {
    return db.$transaction([
      db.student.update({ where: { id }, data }),
      "undo" in history
        ? db.graduation.deleteMany({ where: { studentId: id, id: { in: history.undo } } })
        : db.graduation.create({ data: { studentId: id, kind: "correcao", ...data, date: history.record } }),
    ])
  },
}
