import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/server/auth/session"

async function Redirector(): Promise<null> {
  redirect((await getSession()) ? "/alunos" : "/login")
}

export default function Home() {
  return (
    <Suspense>
      <Redirector />
    </Suspense>
  )
}
