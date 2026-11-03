"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { cn } from "cn"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/brand/avatar"
import { Chip, ChipGroup } from "@/components/brand/chip"
import { beltName, stripesText } from "@/domain/belts"
import { rollCallSchema } from "@/lib/validations/attendance"
import { saveRollCallAction } from "@/server/actions/attendance.actions"
import type { RollCallClass } from "@/server/services/attendance.service"

type Marks = Record<string, Record<number, boolean | null>>

const initialMarks = (classes: RollCallClass[]): Marks =>
  Object.fromEntries(classes.map((c) => [c.slug, Object.fromEntries(c.students.map((s) => [s.id, s.present]))]))

export function RollCall({ classes }: { classes: RollCallClass[] }) {
  const [slug, setSlug] = useState(classes.at(-1)?.slug ?? "")
  const [marks, setMarks] = useState<Marks>(() => initialMarks(classes))
  const [pending, startTransition] = useTransition()
  const cls = classes.find((c) => c.slug === slug)
  if (!cls) return null
  const current = marks[slug] ?? {}
  const present = cls.students.filter((s) => current[s.id] === true).length

  const mark = (id: number, v: boolean) => setMarks((m) => ({ ...m, [slug]: { ...m[slug], [id]: v } }))

  function save() {
    const parsed = rollCallSchema.safeParse({
      classSlug: slug,
      marks: Object.entries(current).filter(([, v]) => v !== null).map(([id, v]) => ({ studentId: Number(id), present: v as boolean })),
    })
    if (!parsed.success) return void toast.error(parsed.error.issues[0].message)
    startTransition(async () => {
      const r = await saveRollCallAction(parsed.data)
      if (r.ok) toast(r.message)
      else toast.error(r.error)
    })
  }

  return (
    <Card className="flex min-w-0 flex-[3_1_460px] flex-col gap-[18px]">
      <ChipGroup aria-label="Escolher aula">
        {classes.map((c) => (
          <Chip key={c.slug} pressed={slug === c.slug} onClick={() => setSlug(c.slug)} className="flex min-h-[52px] flex-col items-start justify-center gap-0.5 rounded-lg px-4 py-1.5">
            <span className="display text-base">{c.name}</span>
            <span className="text-[13px] font-medium">{c.time}</span>
          </Chip>
        ))}
      </ChipGroup>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-3">
        <CardTitle>Chamada · {cls.name}</CardTitle>
        <span className="rounded-full bg-gold px-3 py-1.5 font-bold">{present} de {cls.students.length} presentes</span>
      </div>
      <ul className="m-0 list-none p-0">
        {cls.students.map((s) => {
          const v = current[s.id]
          return (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line py-2.5">
              <div className="flex items-center gap-3">
                <Avatar name={s.shortName} />
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {s.shortName}
                    {s.viaQr && v === true && <Badge variant="pending" className="ml-1.5 px-1.5 py-0.5 text-[11px]">via QR</Badge>}
                  </span>
                  <span className="text-[13px] text-ink-quiet">{beltName(s.belt)} · {stripesText(s.stripes)}</span>
                </div>
              </div>
              <div role="group" aria-label={`Presença de ${s.shortName}`} className="flex gap-2">
                <Button size="sm" variant="plain" aria-pressed={v === true} onClick={() => mark(s.id, true)} className={cn(v === true ? "border-ink bg-gold" : "border-edge bg-white text-[#333]")}>Presente</Button>
                <Button size="sm" variant="plain" aria-pressed={v === false} onClick={() => mark(s.id, false)} className={cn(v === false ? "border-red bg-red text-white" : "border-edge bg-white text-[#333]")}>Falta</Button>
              </div>
            </li>
          )
        })}
        {cls.students.length === 0 && <li className="py-6 text-center text-ink-muted">Nenhum aluno nesta turma.</li>}
      </ul>
      <Button variant="dark" size="lg" disabled={pending} onClick={save}>{pending ? "Salvando…" : "Salvar chamada"}</Button>
    </Card>
  )
}
