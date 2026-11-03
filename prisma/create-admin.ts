/**
 * Cria (ou atualiza a senha de) um responsável com acesso ao painel.
 * Não apaga nem altera nenhum outro dado: seguro para rodar em produção.
 *
 *   npm run admin:create -- --email pessoa@exemplo.com --name "Nome Completo"
 *   npm run admin:create -- --email pessoa@exemplo.com --reset-password
 *
 * Sem --password, gera uma senha forte e mostra UMA vez no terminal.
 */
import "dotenv/config"
import { randomBytes } from "node:crypto"
import { parseArgs } from "node:util"
import { createPrismaClient } from "../src/server/prisma-client"
import { hashPassword } from "../src/server/auth/password"

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    password: { type: "string" },
    "reset-password": { type: "boolean", default: false },
  },
})

async function main() {
  const email = values.email?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Informe um e-mail válido: --email pessoa@exemplo.com')
  }
  if (values.password !== undefined && values.password.length < 8) {
    throw new Error("A senha precisa ter pelo menos 8 caracteres.")
  }

  const db = createPrismaClient()
  try {
    const existing = await db.user.findUnique({ where: { email } })
    if (existing && !values["reset-password"]) {
      console.log(`Já existe um responsável com ${email}. Nada foi alterado (use --reset-password para trocar a senha).`)
      return
    }

    const password = values.password ?? randomBytes(12).toString("base64url")
    const passwordHash = await hashPassword(password)

    if (existing) {
      await db.user.update({ where: { email }, data: { passwordHash, ...(values.name ? { name: values.name } : {}) } })
      console.log(`Senha atualizada para ${email}.`)
    } else {
      await db.user.create({ data: { email, name: values.name?.trim() || email.split("@")[0], passwordHash } })
      console.log(`Responsável criado: ${email}.`)
    }
    if (!values.password) console.log(`Senha gerada (anote, ela não será mostrada de novo): ${password}`)
  } finally {
    await db.$disconnect()
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
