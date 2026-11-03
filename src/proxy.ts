import { NextResponse, type NextRequest } from "next/server"

// Checagem otimista: só a presença do cookie. A validação real (assinatura e
// validade) acontece no layout do painel e em cada Server Action.
const PANEL = ["/alunos", "/mensalidades", "/frequencia", "/financeiro"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has("mk_session")
  if (PANEL.some((p) => pathname.startsWith(p)) && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/alunos/:path*", "/mensalidades/:path*", "/frequencia/:path*", "/financeiro/:path*"],
}
