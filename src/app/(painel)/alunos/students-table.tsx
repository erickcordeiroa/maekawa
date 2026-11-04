"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar } from "@/components/brand/avatar"
import { Belt } from "@/components/brand/belt"
import { Chip, ChipGroup } from "@/components/brand/chip"
import { IconSearch } from "@/components/brand/icons"
import { PaymentBadge } from "@/components/brand/payment-badge"
import { beltName, stripesText } from "@/domain/belts"
import { onlyDigits } from "@/lib/format"
import type { StudentRow } from "@/server/services/student.service"

const FILTERS = [["todas", "Todas"], ["branca", "Branca"], ["azul", "Azul"], ["roxa", "Roxa"], ["marrom", "Marrom"], ["preta", "Preta"], ["kids", "Kids"]] as const
type Filter = (typeof FILTERS)[number][0]
const SITUATIONS = [["ativos", "Ativos"], ["inativos", "Desativados"]] as const
type Situation = (typeof SITUATIONS)[number][0]

export function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const [filter, setFilter] = useState<Filter>("todas")
  const [search, setSearch] = useState("")
  const [situation, setSituation] = useState<Situation>("ativos")

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    const qd = onlyDigits(q)
    return rows.filter(
      (s) =>
        s.inactive === (situation === "inativos") &&
        (filter === "todas" || (filter === "kids" ? s.isKids : s.belt === filter)) &&
        (!q || s.shortName.toLowerCase().includes(q) || (qd.length > 0 && onlyDigits(s.phone).includes(qd)))
    )
  }, [rows, filter, search, situation])

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex h-11 max-w-[380px] flex-[1_1_260px] items-center gap-2 rounded-md border-[1.5px] border-edge px-3 has-[input:focus-visible]:border-ink">
          <IconSearch className="text-ink-muted" />
          <span className="sr-only">Buscar aluno</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou telefone" className="h-10 w-full border-0 bg-transparent text-base outline-none placeholder:text-ink-quiet" />
        </label>
        <ChipGroup aria-label="Situação do aluno">
          {SITUATIONS.map(([id, label]) => (
            <Chip key={id} pressed={situation === id} onClick={() => setSituation(id)}>{label}</Chip>
          ))}
        </ChipGroup>
        <ChipGroup aria-label="Filtrar por faixa">
          {FILTERS.map(([id, label]) => (
            <Chip key={id} pressed={filter === id} onClick={() => setFilter(id)}>{label}</Chip>
          ))}
        </ChipGroup>
      </div>
      <Table minWidth={780}>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Faixa / graus</TableHead>
            <TableHead>Mensalidade</TableHead>
            <TableHead>Última presença</TableHead>
            <TableHead><span className="sr-only">Ações</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={s.shortName} />
                  <div className="flex flex-col">
                    <span className="font-semibold">{s.shortName}</span>
                    <span className="text-[13px] text-ink-quiet">{s.plan} · {s.turma}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Belt belt={s.belt} stripes={s.stripes} />
                  <span className="text-sm">{beltName(s.belt)} · {stripesText(s.stripes)}</span>
                </div>
              </TableCell>
              <TableCell>
                {s.inactive ? <Badge>Desativado</Badge> : s.pending ? <Badge variant="pending">Matrícula a confirmar</Badge> : s.payment ? <PaymentBadge {...s.payment} /> : <span className="text-ink-quiet">—</span>}
              </TableCell>
              <TableCell className="text-[#333]">{s.lastPresence}</TableCell>
              <TableCell className="text-right">
                <Link href={`/alunos/${s.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Ver detalhes</Link>
              </TableCell>
            </TableRow>
          ))}
          {list.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="p-7 text-center text-ink-muted">{situation === "inativos" ? "Nenhum aluno desativado." : "Nenhum aluno encontrado."}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
