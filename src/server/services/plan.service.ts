import "server-only"
import { connection } from "next/server"
import { DomainError } from "@/server/errors"
import { planRepository } from "@/server/repositories/catalog.repository"
import type { PlanActiveInput, PlanInput } from "@/lib/validations/plan"

export type PlanRow = {
  id: number
  name: string
  description: string
  priceCents: number
  isKids: boolean
  active: boolean
  students: number
}

export async function listPlansForAdmin(): Promise<PlanRow[]> {
  await connection()
  const plans = await planRepository.listWithCounts()
  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    isKids: p.isKids,
    active: p.active,
    students: p._count.students,
  }))
}

/** Cria ou edita. Mudar o valor vale para as próximas mensalidades; as já lançadas guardam o valor delas. */
export async function savePlan(input: PlanInput) {
  const same = await planRepository.findByName(input.name)
  if (same && same.id !== input.id) throw new DomainError("Já existe um plano com esse nome.")
  const data = { name: input.name, description: input.description, priceCents: Math.round(input.price * 100), isKids: input.isKids }
  if (input.id) {
    if (!(await planRepository.findById(input.id))) throw new DomainError("Plano não encontrado.")
    await planRepository.update(input.id, data)
    return `Plano ${input.name} atualizado`
  }
  await planRepository.create({ ...data, position: await planRepository.nextPosition() })
  return `Plano ${input.name} criado`
}

/** Planos não são apagados: inativar tira do cadastro público e mantém os alunos atuais */
export async function setPlanActive({ id, active }: PlanActiveInput) {
  const plan = await planRepository.findById(id)
  if (!plan) throw new DomainError("Plano não encontrado.")
  if (!active && plan.active && (await planRepository.countActive()) <= 1)
    throw new DomainError("Mantenha pelo menos um plano ativo para o cadastro de alunos funcionar.")
  await planRepository.update(id, { active })
  return active ? `Plano ${plan.name} reativado` : `Plano ${plan.name} inativado. Ele não aparece mais no cadastro.`
}
