/** Regras puras de CPF (apenas dígitos). */

export const cpfDigits = (v: string) => v.replace(/\D/g, "").slice(0, 11)

/** Confere tamanho, sequência repetida e os dois dígitos verificadores */
export function isValidCpf(value: string): boolean {
  const d = value.replace(/\D/g, "")
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const check = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return check(9) === Number(d[9]) && check(10) === Number(d[10])
}

/** Máscara progressiva para digitação: 123.456.789-01 */
export function maskCpf(v: string) {
  const d = cpfDigits(v)
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
}

