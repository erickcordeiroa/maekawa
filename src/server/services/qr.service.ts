import "server-only"
import { headers } from "next/headers"
import QRCode from "qrcode"

/** URL pública do check-in, derivada do host da requisição (ou NEXT_PUBLIC_APP_URL) */
export async function checkinUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/checkin`
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${proto}://${host}/checkin`
}

export async function checkinQrSvg() {
  return QRCode.toString(await checkinUrl(), { type: "svg", margin: 1, color: { dark: "#0E0E0E", light: "#FFFFFF" } })
}
