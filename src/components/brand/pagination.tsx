"use client"

import { useRef, useState } from "react"
import { IconBack } from "./icons"

/**
 * Paginação no cliente para listas já carregadas. A página é limitada ao total atual:
 * se a lista encolher (filtro, pagamento marcado), o usuário não cai em uma página vazia.
 */
export function usePagination<T>(items: T[], pageSize = 20) {
  const [requested, setRequested] = useState(1)
  const topRef = useRef<HTMLElement>(null)

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(requested, pageCount)
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return {
    pageItems,
    topRef,
    reset: () => setRequested(1),
    pagination: {
      page,
      pageCount,
      total: items.length,
      from: start + 1,
      to: start + pageItems.length,
      goTo: (next: number) => {
        setRequested(next)
        // Os controles ficam no rodapé: volta ao início da lista quando ele saiu da tela
        const top = topRef.current
        if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "start" })
      },
    },
  }
}

/** [1, "gap", 4, 5, 6, "gap", 12]: um "gap" nunca esconde um número só */
function pageWindow(page: number, pageCount: number) {
  const wanted = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b)
  const out: (number | "gap")[] = []
  wanted.forEach((n, i) => {
    const skipped = n - (wanted[i - 1] ?? n) - 1
    if (skipped === 1) out.push(n - 1)
    if (skipped > 1) out.push("gap")
    out.push(n)
  })
  return out
}

type Props = ReturnType<typeof usePagination>["pagination"] & {
  /** Plural do que está sendo listado: "alunos", "mensalidades" */
  noun: string
}

const control =
  "inline-flex size-11 items-center justify-center rounded-lg text-sm font-bold hover:bg-ground aria-disabled:pointer-events-none aria-disabled:opacity-30"

export function Pagination({ page, pageCount, total, from, to, goTo, noun }: Props) {
  if (pageCount <= 1) return null
  const atStart = page === 1
  const atEnd = page === pageCount

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p aria-live="polite" className="tabular m-0 text-sm text-ink-muted">
        Mostrando {from}–{to} de {total} {noun}
      </p>
      <nav aria-label={`Paginação de ${noun}`} className="flex items-center gap-1 max-[479px]:w-full max-[479px]:justify-between">
        {/* aria-disabled em vez de disabled: o foco do teclado não se perde ao chegar na ponta */}
        <button type="button" className={control} aria-label="Página anterior" aria-disabled={atStart} onClick={() => !atStart && goTo(page - 1)}>
          <IconBack />
        </button>
        <span className="tabular px-2 text-sm font-semibold min-[480px]:hidden">{page} de {pageCount}</span>
        <div className="flex items-center gap-1 max-[479px]:hidden">
          {pageWindow(page, pageCount).map((n, i) =>
            n === "gap" ? (
              <span key={`gap-${i}`} aria-hidden className="inline-flex size-11 items-center justify-center text-ink-muted">…</span>
            ) : (
              <button
                key={n}
                type="button"
                aria-label={`Página ${n}`}
                aria-current={n === page ? "page" : undefined}
                onClick={() => goTo(n)}
                className={`${control} tabular aria-[current=page]:bg-ink aria-[current=page]:text-gold`}
              >
                {n}
              </button>
            ),
          )}
        </div>
        <button type="button" className={control} aria-label="Próxima página" aria-disabled={atEnd} onClick={() => !atEnd && goTo(page + 1)}>
          <IconBack className="-scale-x-100" />
        </button>
      </nav>
    </div>
  )
}
