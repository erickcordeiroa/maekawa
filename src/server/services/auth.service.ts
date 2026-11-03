import "server-only"
import { userRepository } from "@/server/repositories/catalog.repository"
import { verifyPassword } from "@/server/auth/password"

export async function authenticate(email: string, password: string) {
  const user = await userRepository.findByEmail(email.toLowerCase().trim())
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null
  return user
}
