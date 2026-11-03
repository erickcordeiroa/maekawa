@AGENTS.md

# Projeto
- Leia `.specify/memory/constitution.md` (arquitetura e regras) e `DESIGN.md` (sistema visual) antes de mudar código ou UI.
- Camadas: app → server/actions → server/services → server/repositories. Prisma só em repositories e prisma-client.ts.
- Formulários: schema Zod em src/lib/validations + react-hook-form + Field/FieldError do shadcn; revalidar no action com `runAction`.
- Cache Components ativo: dados por requisição via `requestToday()`/`connection()` dentro de Suspense.
- Verificação: `npx tsc --noEmit && npm run lint && npm run build`.
