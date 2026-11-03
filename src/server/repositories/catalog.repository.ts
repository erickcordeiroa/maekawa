import "server-only"
import { db } from "@/server/db"

export const planRepository = {
  list: () => db.plan.findMany({ orderBy: { id: "asc" } }),
  findByName: (name: string) => db.plan.findUnique({ where: { name } }),
}

export const classGroupRepository = {
  list: () => db.classGroup.findMany({ orderBy: { position: "asc" }, include: { students: { where: { status: "ativo" }, orderBy: { id: "asc" } } } }),
  findBySlug: (slug: string) => db.classGroup.findUnique({ where: { slug } }),
}

export const userRepository = {
  findByEmail: (email: string) => db.user.findUnique({ where: { email } }),
  findById: (id: number) => db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } }),
}
