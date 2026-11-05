/** R$ 13.450 · "− R$ 3.200" para negativos (valores em centavos) */
export function brl(cents: number) {
  const v = Math.round(Math.abs(cents) / 100)
  const s = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${cents < 0 ? "− " : ""}R$ ${s}`
}

export function initials(name: string) {
  const words = name.split(" ")
  return words
    .filter((w, i) => w.length > 2 || i === 0)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export const onlyDigits = (v: string) => v.replace(/\D/g, "")

export function maskPhone(v: string) {
  const d = onlyDigits(v || "").slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const formatPhone = (digits: string | null | undefined) => maskPhone(digits ?? "")

export const firstName = (n: string) => n.split(" ")[0]
