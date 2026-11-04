import type { Metadata } from "next"
import { listPlansForAdmin } from "@/server/services/plan.service"
import { PageHead } from "@/components/brand/page-head"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { brl } from "@/lib/format"
import { PlanActiveToggle, PlanFormButton } from "./plan-form"

export const metadata: Metadata = { title: "Planos" }

export default async function PlanosPage() {
  const plans = await listPlansForAdmin()

  return (
    <>
      <PageHead title="Planos" description="Os planos ativos aparecem na ficha de matrícula. Mudar o valor vale para as próximas mensalidades.">
        <PlanFormButton />
      </PageHead>

      <Card className="p-0">
        {plans.length === 0 ? (
          <p className="m-0 p-7 text-ink-muted">Nenhum plano cadastrado. Crie o primeiro para liberar a ficha de matrícula.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Valor mensal</TableHead>
                <TableHead>Alunos ativos</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p) => (
                <TableRow key={p.id} className={p.active ? undefined : "text-ink-muted"}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-2 font-bold">
                        {p.name}
                        {p.isKids && <Badge>Kids</Badge>}
                      </span>
                      <span className="text-sm text-ink-muted">{p.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular font-semibold">{brl(p.priceCents)}</TableCell>
                  <TableCell className="tabular">{p.students}</TableCell>
                  <TableCell>{p.active ? <Badge variant="paid">Ativo</Badge> : <Badge>Inativo</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <PlanFormButton plan={p} />
                      <PlanActiveToggle id={p.id} active={p.active} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  )
}
