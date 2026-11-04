import "server-only"
import { db } from "@/server/db"
import type { Prisma } from "@/generated/prisma/client"

const planOrder = [{ position: "asc" }, { id: "asc" }] satisfies Prisma.PlanOrderByWithRelationInput[]

export const planRepository = {
  listActive: () => db.plan.findMany({ where: { active: true }, orderBy: planOrder }),
  listWithCounts: () =>
    db.plan.findMany({ orderBy: planOrder, include: { _count: { select: { students: { where: { status: "ativo" } } } } } }),
  findById: (id: number) => db.plan.findUnique({ where: { id } }),
  findByName: (name: string) => db.plan.findUnique({ where: { name } }),
  countActive: () => db.plan.count({ where: { active: true } }),
  nextPosition: async () => ((await db.plan.aggregate({ _max: { position: true } }))._max.position ?? 0) + 1,
  create: (data: Prisma.PlanCreateInput) => db.plan.create({ data }),
  update: (id: number, data: Prisma.PlanUpdateInput) => db.plan.update({ where: { id }, data }),
}

export const classGroupRepository = {
  list: () => db.classGroup.findMany({ orderBy: { position: "asc" }, include: { students: { where: { status: "ativo" }, orderBy: { id: "asc" } } } }),
  listBasic: () => db.classGroup.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true, startTime: true } }),
  findById: (id: number) => db.classGroup.findUnique({ where: { id } }),
  findBySlug: (slug: string) => db.classGroup.findUnique({ where: { slug } }),
}

export const userRepository = {
  findByEmail: (email: string) => db.user.findUnique({ where: { email } }),
  findById: (id: number) => db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } }),
}
