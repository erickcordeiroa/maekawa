import type { Metadata } from "next"
import { Inter, Oswald } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] })

export const metadata: Metadata = {
  title: { default: "Portal Murilo K. Maekawa BJJ", template: "%s · Murilo K. Maekawa BJJ" },
  description: "Gestão de alunos, mensalidades, frequência e financeiro da academia.",
  icons: { icon: "/logo.webp" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${oswald.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
