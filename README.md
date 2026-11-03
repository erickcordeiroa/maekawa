# Portal Murilo K. Maekawa BJJ

Painel da academia (alunos, mensalidades, frequência, financeiro) + telas públicas de matrícula e check-in por QR code.
Porta fiel do protótipo HTML — o sistema visual está documentado em [`DESIGN.md`](DESIGN.md).

## Rodando

```bash
npm install            # também gera o Prisma Client
npx prisma migrate dev # aplica as migrations no MySQL do DATABASE_URL
npm run db:seed        # dados do protótipo, ancorados na data de hoje
npm run dev
```

Login de desenvolvimento: `murilo@academia.com.br` / `oss12345`.

## Arquitetura

```
src/
  app/                 rotas (App Router)
    (auth)/            login, recuperar-senha
    (public)/          cadastro (ficha de matrícula), checkin
    (painel)/          alunos, alunos/[id], mensalidades, frequencia, financeiro
  components/ui/       shadcn customizado com os tokens da marca
  components/brand/    Belt, Chip, Kpi, Avatar, Logo, ícones…
  domain/              regras puras (faixas/graus, situação de pagamento, períodos)
  lib/validations/     schemas Zod compartilhados entre formulário e Server Action
  server/
    actions/           Server Actions (auth + validação + revalidação)
    services/          regras de negócio e view models
    repositories/      acesso a dados (único lugar que usa o Prisma)
    prisma-client.ts   único lugar que conhece o banco concreto
  proxy.ts             checagem otimista de sessão (Next 16: antigo middleware)
prisma/                schema, migrations, seed
```

## Ferramentas instaladas

- **Spec Kit** (`.specify/`, skills `/speckit-*`): princípios em `.specify/memory/constitution.md`.
- **Impeccable** (`.claude/skills/impeccable`): design system em `DESIGN.md` + `.impeccable/design.json`; hook que audita a UI após edições.

## Pendências conhecidas

- Envio de e-mail da recuperação de senha (tela pronta, sem envio).
- "Editar" dados do aluno e confirmação de matrículas pendentes.
- Mensalidades do mês não são geradas automaticamente (o seed cria as atuais).
