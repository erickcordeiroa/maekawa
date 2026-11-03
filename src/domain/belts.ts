export const BELTS = {
  branca: { name: "Branca", color: "#FFFFFF", bar: "#0E0E0E" },
  cinza: { name: "Cinza", color: "#8E8E8E", bar: "#0E0E0E" },
  amarela: { name: "Amarela", color: "#F3C519", bar: "#0E0E0E" },
  laranja: { name: "Laranja", color: "#E8731A", bar: "#0E0E0E" },
  verde: { name: "Verde", color: "#2E7D32", bar: "#0E0E0E" },
  azul: { name: "Azul", color: "#1F4FB5", bar: "#0E0E0E" },
  roxa: { name: "Roxa", color: "#6B2A9E", bar: "#0E0E0E" },
  marrom: { name: "Marrom", color: "#6B3E1F", bar: "#0E0E0E" },
  preta: { name: "Preta", color: "#0E0E0E", bar: "#CE1317" },
} as const

export type BeltId = keyof typeof BELTS
export const BELT_IDS = Object.keys(BELTS) as [BeltId, ...BeltId[]]

export const ADULT_ORDER: BeltId[] = ["branca", "azul", "roxa", "marrom", "preta"]
export const KIDS_ORDER: BeltId[] = ["branca", "cinza", "amarela", "laranja", "verde"]

export const beltName = (b: string) => BELTS[b as BeltId]?.name ?? b

export const stripesText = (n: number) => `${n} ${n === 1 ? "grau" : "graus"}`

export const maxStripes = (belt: string) => (belt === "preta" ? 6 : 4)

export function nextBelt(belt: string, isKids: boolean): BeltId | null {
  const order = isKids ? KIDS_ORDER : ADULT_ORDER
  const i = order.indexOf(belt as BeltId)
  return i >= 0 && i < order.length - 1 ? order[i + 1] : null
}

export type GraduationKind = "inicio" | "grau" | "promocao"

export function graduationLabel(kind: string, belt: string, stripes: number) {
  const n = beltName(belt)
  if (kind === "inicio") return `Início na faixa ${n}`
  if (kind === "promocao") return `Promovido à faixa ${n}`
  return `Faixa ${n} · ${stripes}º grau`
}
