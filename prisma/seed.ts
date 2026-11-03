/**
 * Popula o banco com os dados do protótipo, ancorados na data de hoje
 * para que mensalidades, frequência e financeiro pareçam "vivos".
 * Rodar: npm run db:seed (ou npx prisma db seed)
 */
import "dotenv/config"
import { createPrismaClient } from "../src/server/prisma-client"
import { hashPassword } from "../src/server/auth/password"
import { addDays, addMonths, dateOnly, monthRef, today as todayFn } from "../src/lib/dates"

const db = createPrismaClient()
const today = todayFn()
const d = (iso: string) => dateOnly(iso)
const cents = (reais: number) => reais * 100

// PRNG determinístico para a frequência
let seed = 42
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

type Hist = [kind: "inicio" | "grau" | "promocao", belt: string, stripes: number, date: string]
type S = {
  fullName: string; shortName: string; plan: string; belt: string; stripes: number
  pay: "pago" | "pendente" | "atrasado"; dueDay: number; birth: string; phone: string; address: string
  guardian?: [string, string]; since: string; cls: string; kids?: boolean; rate: number; lastDaysAgo?: number; hist: Hist[]
}

const students: S[] = [
  { fullName: "João Pereira da Silva", shortName: "João Pereira", plan: "Mensal", belt: "azul", stripes: 2, pay: "pago", dueDay: 5, birth: "1996-07-08", phone: "13999990001", address: "Rua [ENDEREÇO], 123, Centro, Registro/SP", since: "2023-03-14", cls: "noite", rate: 0.8,
    hist: [["grau", "azul", 2, "2026-08-15"], ["grau", "azul", 1, "2026-03-10"], ["promocao", "azul", 0, "2025-09-20"], ["grau", "branca", 4, "2025-04-05"], ["inicio", "branca", 0, "2023-03-14"]] },
  { fullName: "Ana Souza", shortName: "Ana Souza", plan: "Trimestral", belt: "branca", stripes: 4, pay: "pendente", dueDay: 10, birth: "2001-01-22", phone: "13999990002", address: "Rua [ENDEREÇO], 45, Vila Tupi, Registro/SP", since: "2025-02-02", cls: "manha", rate: 0.55,
    hist: [["grau", "branca", 4, "2026-10-12"], ["grau", "branca", 3, "2026-06-20"], ["inicio", "branca", 0, "2025-02-02"]] },
  { fullName: "Carlos Nakamura", shortName: "Carlos Nakamura", plan: "Mensal", belt: "roxa", stripes: 1, pay: "pago", dueDay: 5, birth: "1989-11-30", phone: "13999990003", address: "Av. [ENDEREÇO], 900, Centro, Registro/SP", since: "2019-01-10", cls: "manha", rate: 0.9,
    hist: [["grau", "roxa", 1, "2026-07-01"], ["promocao", "roxa", 0, "2025-12-15"]] },
  { fullName: "Beatriz Lima", shortName: "Beatriz Lima", plan: "Mensal", belt: "branca", stripes: 1, pay: "atrasado", dueDay: 20, birth: "1999-05-14", phone: "13999990004", address: "Rua [ENDEREÇO], 12, Arapongal, Registro/SP", since: "2026-08-03", cls: "noite", rate: 0.35, lastDaysAgo: 12,
    hist: [["grau", "branca", 1, "2026-10-20"], ["inicio", "branca", 0, "2026-08-03"]] },
  { fullName: "Rafael Oliveira", shortName: "Rafael Oliveira", plan: "Mensal", belt: "marrom", stripes: 3, pay: "pago", dueDay: 5, birth: "1985-03-02", phone: "13999990005", address: "Rua [ENDEREÇO], 300, Centro, Registro/SP", since: "2015-05-05", cls: "noite", rate: 0.6,
    hist: [["grau", "marrom", 3, "2026-09-10"], ["grau", "marrom", 2, "2026-02-02"]] },
  { fullName: "Pedro Henrique Costa", shortName: "Pedro Henrique", plan: "Kids", belt: "amarela", stripes: 2, pay: "pago", dueDay: 10, birth: "2016-09-11", phone: "13999990006", address: "Rua [ENDEREÇO], 77, Jardim Valéria, Registro/SP", guardian: ["Mariana Costa", "13999991006"], since: "2024-03-01", cls: "kids", kids: true, rate: 0.7,
    hist: [["grau", "amarela", 2, "2026-10-05"], ["promocao", "amarela", 0, "2025-12-10"], ["inicio", "branca", 0, "2024-03-01"]] },
  { fullName: "Lucas Tanaka", shortName: "Lucas Tanaka", plan: "Trimestral", belt: "azul", stripes: 0, pay: "atrasado", dueDay: 15, birth: "1994-12-19", phone: "13999990007", address: "Rua [ENDEREÇO], 510, Centro, Registro/SP", since: "2022-06-12", cls: "noite", rate: 0.5, lastDaysAgo: 20,
    hist: [["promocao", "azul", 0, "2026-05-30"]] },
  { fullName: "Marcos Silva", shortName: "Marcos Silva", plan: "Mensal", belt: "preta", stripes: 1, pay: "pago", dueDay: 5, birth: "1982-08-25", phone: "13999990008", address: "Rua [ENDEREÇO], 8, Centro, Registro/SP", since: "2010-07-07", cls: "noite", rate: 0.75,
    hist: [["grau", "preta", 1, "2025-03-15"], ["promocao", "preta", 0, "2021-12-10"]] },
  { fullName: "Júlia Costa", shortName: "Júlia Costa", plan: "Kids", belt: "cinza", stripes: 1, pay: "pendente", dueDay: 15, birth: "2018-04-03", phone: "13999990009", address: "Rua [ENDEREÇO], 20, Vila Nova, Registro/SP", guardian: ["Paulo Costa", "13999991009"], since: "2025-02-15", cls: "kids", kids: true, rate: 0.6,
    hist: [["grau", "cinza", 1, "2026-09-01"], ["promocao", "cinza", 0, "2026-03-20"]] },
  { fullName: "Gabriel Rocha", shortName: "Gabriel Rocha", plan: "Mensal", belt: "azul", stripes: 1, pay: "pago", dueDay: 5, birth: "1998-10-17", phone: "13999990010", address: "Rua [ENDEREÇO], 66, Centro, Registro/SP", since: "2021-09-09", cls: "manha", rate: 0.65,
    hist: [["grau", "azul", 1, "2026-08-22"], ["promocao", "azul", 0, "2026-01-14"]] },
]

// [entradas, saídas] em reais dos últimos 12 meses (mais antigo → mês atual)
const MONTHLY: [number, number][] = [[10200, 6100], [9400, 6300], [10800, 6050], [11600, 6400], [11900, 6200], [12100, 6550], [11400, 6900], [12300, 6300], [12900, 6450], [13200, 6600], [13600, 6700], [13450, 6520]]
const INCOME_SPLIT: [string, number][] = [["Mensalidades", 11850], ["Venda de kimonos e faixas", 700], ["Matrículas", 600], ["Aulas particulares", 300]]
const EXPENSE_SPLIT: [string, number][] = [["Aluguel", 3200], ["Professores auxiliares", 1200], ["Energia e água", 980], ["Materiais e limpeza", 640], ["Marketing", 500]]

function split(total: number, parts: [string, number][]) {
  const base = parts.reduce((a, p) => a + p[1], 0)
  const out = parts.map(([n, v]) => [n, Math.round((v / base) * total)] as [string, number])
  out[0][1] += total - out.reduce((a, p) => a + p[1], 0)
  return out
}

async function main() {
  await db.attendance.deleteMany()
  await db.payment.deleteMany()
  await db.graduation.deleteMany()
  await db.student.deleteMany()
  await db.classGroup.deleteMany()
  await db.plan.deleteMany()
  await db.transaction.deleteMany()
  await db.user.deleteMany()
  // Reinicia os IDs (alunos 1..10 como no protótipo).
  for (const t of ["Attendance", "Payment", "Graduation", "Student", "ClassGroup", "Plan", "Transaction", "User"]) {
    await db.$executeRawUnsafe(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`)
  }

  await db.user.create({ data: { name: "Murilo K. Maekawa", email: "murilo@academia.com.br", passwordHash: await hashPassword("oss12345") } })

  const plans = Object.fromEntries(
    await Promise.all(
      [["Mensal", "Adulto · treinos livres", 150], ["Trimestral", "Adulto · 3 meses", 135], ["Kids", "4 a 15 anos", 120]].map(async ([name, description, price]) => {
        const p = await db.plan.create({ data: { name: name as string, description: description as string, priceCents: cents(price as number) } })
        return [p.name, p] as const
      })
    )
  )

  const classes = Object.fromEntries(
    await Promise.all(
      [["manha", "Adulto manhã", "07:00", 0], ["kids", "Kids", "17:30", 1], ["noite", "Adulto noite", "19:00", 2]].map(async ([slug, name, startTime, position]) => {
        const c = await db.classGroup.create({ data: { slug: slug as string, name: name as string, startTime: startTime as string, position: position as number } })
        return [c.slug, c] as const
      })
    )
  )

  const thisMonth = dateOnly(`${monthRef(today)}-01`)
  const lastMonth = addMonths(thisMonth, -1)

  for (const s of students) {
    const plan = plans[s.plan]
    const cls = classes[s.cls]
    const st = await db.student.create({
      data: {
        fullName: s.fullName, shortName: s.shortName, phone: s.phone, birthDate: d(s.birth), address: s.address,
        guardianName: s.guardian?.[0], guardianPhone: s.guardian?.[1], belt: s.belt, stripes: s.stripes, isKids: !!s.kids,
        dueDay: s.dueDay, memberSince: d(s.since), planId: plan.id, classGroupId: cls.id,
        graduations: { create: s.hist.map(([kind, belt, stripes, date]) => ({ kind, belt, stripes, date: d(date) })) },
      },
    })

    // Mensalidade: atrasados devem o mês anterior; os demais, o mês atual
    const month = s.pay === "atrasado" ? lastMonth : thisMonth
    const due = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), s.dueDay))
    await db.payment.create({
      data: {
        studentId: st.id, reference: monthRef(month), amountCents: plan.priceCents, dueDate: due,
        paidAt: s.pay === "pago" ? addDays(today, -Math.floor(rand() * 3)) : null,
      },
    })

    // Frequência dos últimos 70 dias (seg–sáb), sem a aula de hoje
    const since = d(s.since)
    const lastAllowed = addDays(today, -(s.lastDaysAgo ?? 1))
    const rows = []
    for (let i = 70; i >= 1; i--) {
      const day = addDays(today, -i)
      if (day.getUTCDay() === 0 || day < since || day > lastAllowed) continue
      const isLast = day.getTime() === lastAllowed.getTime()
      if (!isLast && rand() > s.rate) continue
      const [h, m] = cls.startTime.split(":").map(Number)
      rows.push({ studentId: st.id, classGroupId: cls.id, date: day, present: true, source: "manual", checkedInAt: new Date(day.getTime() + (h + 3) * 3600_000 + m * 60_000) })
    }
    await db.attendance.createMany({ data: rows })
  }

  // Financeiro: lançamentos por categoria em cada um dos últimos 12 meses
  const tx: { date: Date; description: string; kind: string; category: string; amountCents: number }[] = []
  for (let i = 0; i < 12; i++) {
    const month = addMonths(thisMonth, i - 11)
    const isCurrent = i === 11
    const maxDay = isCurrent ? Math.max(1, today.getUTCDate()) : 28
    const day = (n: number) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), Math.min(n, maxDay)))
    const [inc, exp] = MONTHLY[i]
    split(inc, INCOME_SPLIT).forEach(([category, v], k) => tx.push({ date: day(2 + k * 6), description: category, kind: "entrada", category, amountCents: cents(v) }))
    split(exp, EXPENSE_SPLIT).forEach(([category, v], k) => tx.push({ date: day(1 + k * 5), description: category === "Aluguel" ? "Aluguel do espaço" : category, kind: "saida", category, amountCents: cents(v) }))
  }
  await db.transaction.createMany({ data: tx })

  console.log(`Seed ok: ${students.length} alunos, ${tx.length} lançamentos.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
