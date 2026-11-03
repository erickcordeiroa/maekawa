<!--
Sync Impact Report
- Version: 0.0.0 → 1.0.0 (ratificação inicial)
- Princípios adicionados: I–VI
- Templates: plan/spec/tasks sem alterações necessárias
-->

# Constituição — Portal Murilo K. Maekawa BJJ

## Core Principles

### I. Fidelidade ao design (NON-NEGOTIABLE)
Toda tela segue `DESIGN.md` ("O Tatame Preto"): tokens de `src/app/globals.css`, Oswald caixa-alta para
títulos/números, Inter no corpo, alvos de toque ≥ 44px, campos de 46px, cartões planos sem sombra,
vermelho apenas para estados negativos. Componentes visuais novos partem de `src/components/ui`
(shadcn customizado) ou `src/components/brand`. Mudanças visuais passam por `/impeccable` (critique/polish).

### II. Camadas com responsabilidade única
`app/` (rotas e UI) → `server/actions` (entrada, auth, revalidação) → `server/services` (regras de
negócio e view models) → `server/repositories` (único lugar que fala com o Prisma) → `server/prisma-client.ts`
(único lugar que conhece o banco concreto). Páginas e componentes nunca importam o Prisma diretamente.
Regras puras (faixas, graus, situação de pagamento) vivem em `src/domain` sem dependências de servidor.

### III. Banco portável (SQLite agora, MySQL depois)
O schema não usa recursos exclusivos de um banco: "enums" são `String` validados no domínio, valores
monetários são inteiros em centavos e datas de calendário são meia-noite UTC do dia local
(America/Sao_Paulo). Trocar de banco = mudar `provider` no schema + adapter em `prisma-client.ts`.

### IV. Validação única, nos dois lados
Cada formulário tem um schema Zod em `src/lib/validations`, usado no cliente (react-hook-form +
`Field`/`FieldError` do shadcn) e revalidado no Server Action via `runAction`. Mensagens em português,
nomeando o problema e a correção. Erros de regra de negócio usam `DomainError`.

### V. Segurança por padrão
Todo Server Action do painel chama `requireSession()`; o `proxy.ts` é só checagem otimista.
Ações públicas (matrícula, check-in) validam a entrada e nunca expõem dados além do necessário.
Segredos ficam em `.env` (nunca versionado).

### VI. Cache Components
O projeto roda com `cacheComponents: true`. Leitura de cookies, data atual ou banco acontece por
requisição (`requestToday()`/`connection()`) dentro de `<Suspense>` (layouts ou `loading.tsx`).

## Restrições técnicas
Next.js 16 (App Router, Turbopack), React 19, TypeScript estrito, Tailwind v4, shadcn (radix-nova),
Prisma 7 com driver adapter, Zod 4, react-hook-form. Idioma da interface: pt-BR.

## Fluxo de desenvolvimento
Features novas seguem Spec Kit: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
Antes de concluir: `npx tsc --noEmit`, `npm run lint` e `npm run build` sem erros.

## Governance
Esta constituição prevalece sobre preferências individuais. Alterações exigem atualização da versão
(SemVer) e do relatório de impacto no topo deste arquivo.

**Version**: 1.0.0 | **Ratified**: 2026-11-03 | **Last Amended**: 2026-11-03
