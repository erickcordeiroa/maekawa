# Passo a passo: MySQL + deploy no Dokploy

Roteiro para trocar o SQLite por MySQL e publicar o portal no Dokploy.
Execute na ordem. As etapas 1 a 4 mexem no código; as etapas 5 a 10 são no painel do Dokploy.

---

## Etapa 0 — Repositório Git

O Dokploy faz o deploy a partir de um repositório (GitHub, GitLab, Gitea ou Bitbucket).

```bash
git init
git add .
git commit -m "Portal Maekawa: versão inicial"
git branch -M main
git remote add origin git@github.com:SEU_USUARIO/maekawa.git
git push -u origin main
```

Confira antes do commit que `.env` e `prisma/*.db` **não** entram (o `.gitignore` já cuida disso).

---

## Etapa 1 — Dependências

```bash
npm i @prisma/adapter-mariadb dotenv
npm uninstall @prisma/adapter-better-sqlite3 better-sqlite3 @types/better-sqlite3
```

- `@prisma/adapter-mariadb` é o driver do Prisma 7 para MySQL e MariaDB.
- `dotenv` hoje só chega por dependência indireta; o `prisma.config.ts` importa esse pacote, então ele entra como dependência direta.

---

## Etapa 2 — `prisma/schema.prisma`

```prisma
datasource db {
  provider = "mysql"
}
```

Recomendado: campos de texto livre com mais de 191 caracteres.

```prisma
model Student {
  // ...
  address String @db.VarChar(500)
}

model Transaction {
  // ...
  description String @db.VarChar(500)
}
```

---

## Etapa 3 — `src/server/prisma-client.ts`

```ts
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@/generated/prisma/client"

export type { PrismaClient }

export function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!)
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectionLimit: 5,
  })
  return new PrismaClient({ adapter })
}
```

---

## Etapa 4 — Migrations e seed

### 4.1 Recriar as migrations para MySQL

As migrations atuais são SQL de SQLite. Suba um MySQL local para gerar as novas:

```bash
docker run -d --name maekawa-mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=maekawa mysql:8
```

No `.env` local:

```
DATABASE_URL="mysql://root:root@localhost:3306/maekawa"
```

Depois:

```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
npm run db:seed
npm run dev   # testar os fluxos
```

Faça commit da pasta `prisma/migrations` nova. É ela que o servidor aplica.

### 4.2 Ajustar o reset de IDs do seed

Em `prisma/seed.ts`, troque a linha do `sqlite_sequence` por:

```ts
for (const t of ["Attendance", "Payment", "Graduation", "Student", "ClassGroup", "Plan", "Transaction", "User"]) {
  await db.$executeRawUnsafe(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`)
}
```

### 4.3 Script de produção para iniciar

Em `package.json`, adicione:

```json
"start:prod": "prisma migrate deploy && next start -p ${PORT:-3000}"
```

O `migrate deploy` aplica as migrations pendentes a cada deploy. Ele nunca apaga dados.

### 4.4 Dockerfile na raiz (recomendado)

Esse Dockerfile tem mais controle que o Nixpacks:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
# o build não acessa o banco, mas o prisma.config exige a variável
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

Faça commit e push de tudo (etapas 1 a 4).

---

## Etapa 5 — Criar o MySQL no Dokploy

1. **Projects → Create Project** → nome `maekawa`.
2. Dentro do projeto: **Create Service → Database → MySQL**.
   - Nome: `maekawa-db`
   - Database Name: `maekawa`
   - Database User: `maekawa`
   - Database Password: senha forte, gerada
   - Root Password: outra senha forte
   - Docker Image: `mysql:8`
3. Clique em **Deploy** e espere o status ficar *running*.
4. Na aba do banco, copie a **Internal Connection URL**. Ela tem este formato:

   ```
   mysql://maekawa:SENHA@maekawa-db-xxxxxx:3306/maekawa
   ```

   O host é o nome interno do serviço na rede do Docker. Ele só funciona entre serviços do Dokploy.

> **Não ative a "External Port"** se não precisar. Para acessar pelo seu computador (DBeaver, por exemplo), prefira um túnel SSH:
> `ssh -L 3307:localhost:PORTA_EXTERNA usuario@servidor`
> Se precisar ativar, use senha forte e libere a porta só para o seu IP no firewall.

---

## Etapa 6 — Criar a aplicação

1. No mesmo projeto: **Create Service → Application** → nome `maekawa-web`.
2. **Provider**: GitHub (ou Git), repositório `maekawa`, branch `main`.
3. **Build Type**: `Dockerfile` (caminho `./Dockerfile`).
   - Se preferir o Nixpacks: Start Command `npm run start:prod`.

---

## Etapa 7 — Variáveis de ambiente (aba Environment)

```
DATABASE_URL=mysql://maekawa:SENHA@maekawa-db-xxxxxx:3306/maekawa
SESSION_SECRET=<gere com: openssl rand -base64 48>
NEXT_PUBLIC_APP_URL=https://portal.seudominio.com.br
PORT=3000
```

- `DATABASE_URL` vem da Internal Connection URL da etapa 5.
- `NEXT_PUBLIC_APP_URL` é usada no link de cadastro e no QR code do check-in. Ela é embutida **no build**, então cadastre também em **Build Args** (`NEXT_PUBLIC_APP_URL=...`).
- Se a senha tiver caracteres especiais (`@ : / # ?`), codifique na URL. Por exemplo, `@` vira `%40`.

---

## Etapa 8 — Domínio e HTTPS (aba Domains)

1. **Add Domain** → `portal.seudominio.com.br`, Container Port `3000`, HTTPS ligado, certificado **Let's Encrypt**.
2. No seu provedor de DNS: registro **A** `portal` → IP do servidor do Dokploy.

> **Obrigatório.** Em produção o cookie de sessão é `secure`, então só funciona em **HTTPS**. Acessando por `http://IP:porta`, o login aceita a senha, mas volta para a tela de login.

---

## Etapa 9 — Deploy e primeiro acesso

1. Clique em **Deploy** e acompanhe os logs. Deve aparecer `prisma migrate deploy` aplicando a migration `init` e depois o `next start`.
2. **Usuário inicial.** Abra a aba de terminal do container (**Terminal / Open Terminal**). Escolha uma das opções:
   - **Homologação**: `npm run db:seed`. Cria os dados do protótipo e o usuário `murilo@academia.com.br` / `oss12345`.
   - **Produção real**: **não** rode o seed, porque ele apaga tudo antes de popular. Crie só os responsáveis:

     ```bash
     npm run admin:create -- --email lhpmurilo@gmail.com --name "Murilo K. Maekawa"
     npm run admin:create -- --email tiemimaek@gmail.com --name "Dani"
     ```

     Cada comando mostra uma senha gerada **uma única vez**. Anote e repasse por um canal seguro.
     - Rodar de novo com o mesmo e-mail não altera nada.
     - Para trocar a senha (esqueceu, vazou): adicione `--reset-password`.
     - Para definir uma senha específica: `--password "..."`, com no mínimo 8 caracteres. Ela fica no histórico do terminal, então prefira a senha gerada.
3. Acesse `https://portal.seudominio.com.br` e faça login.

---

## Etapa 10 — Backups e operação

- **Backups**: em **Settings → S3 Destinations**, cadastre um bucket (S3, R2, Backblaze...). Depois, no banco `maekawa-db`, aba **Backups**: backup diário, retenção de 7 a 30 dias.
- **Deploy automático**: na aplicação, ative **Auto Deploy** (webhook do GitHub). Cada push na `main` gera build, aplica as migrations e publica.
- **Novas migrations**: crie localmente com `npx prisma migrate dev --name descricao`, faça commit e push. O servidor aplica sozinho com o `migrate deploy`.
- **Fuso horário**: não precisa configurar no container. O código calcula "hoje" em `America/Sao_Paulo`.

---

## Checklist rápido

- [ ] Repositório no Git, sem `.env` e sem `.db`
- [ ] Adapter MariaDB instalado, schema com `provider = "mysql"`
- [ ] `prisma-client.ts` usando `PrismaMariaDb`
- [ ] Migrations recriadas e commitadas
- [ ] Seed com `AUTO_INCREMENT` no lugar do `sqlite_sequence`
- [ ] `start:prod` com `prisma migrate deploy`, e Dockerfile
- [ ] MySQL criado no Dokploy (sem porta externa)
- [ ] Variáveis: `DATABASE_URL` interna, `SESSION_SECRET` forte, `NEXT_PUBLIC_APP_URL` também em Build Args
- [ ] Domínio com HTTPS (Let's Encrypt)
- [ ] Usuário inicial criado
- [ ] Backup automático do banco configurado

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Login volta para a tela de login | Acesso sem HTTPS (cookie `secure`) |
| `ECONNREFUSED` / `getaddrinfo ENOTFOUND` | Host errado na `DATABASE_URL`: use o host **interno** do Dokploy, e app e banco precisam estar no mesmo servidor/rede |
| `Access denied for user` | Senha com caractere especial sem codificar na URL |
| QR code / link de cadastro com `localhost` | `NEXT_PUBLIC_APP_URL` não foi passada no **build** |
| `P3005` / erro de migration | Migrations antigas de SQLite ainda no repositório (refaça a etapa 4.1) |
| `SESSION_SECRET ausente ou curto` | Variável ausente ou com menos de 32 caracteres |
