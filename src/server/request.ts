import "server-only"
import { connection } from "next/server"
import { today } from "@/lib/dates"

/**
 * "Hoje" no fuso da academia, lido em tempo de requisição.
 * O connection() impede que o Next pré-renderize o resultado no build
 * (com Cache Components, dados do banco e a data atual são sempre por requisição).
 */
export async function requestToday() {
  await connection()
  return today()
}
