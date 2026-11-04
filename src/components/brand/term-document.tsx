import { cn } from "cn"
import { TERM_TITLE, termSectionsFor } from "@/domain/term"

type Props = {
  /** Dados de identificação já preenchidos no sistema (rótulo, valor) */
  identification: [string, string][]
  isMinor: boolean
  className?: string
}

/** Texto do Termo de Responsabilidade, usado na ficha de matrícula e na versão para impressão */
export function TermDocument({ identification, isMinor, className }: Props) {
  const sections = termSectionsFor(isMinor)
  return (
    <article className={cn("flex flex-col gap-4 text-[15px] leading-relaxed", className)}>
      <header className="flex flex-col gap-1">
        <h3 className="text-xl">{TERM_TITLE}</h3>
        <p className="m-0 text-sm text-ink-muted">Murilo K. Maekawa BJJ · Academia de Jiu-Jitsu</p>
      </header>
      <section className="flex flex-col gap-2">
        <h4 className="text-[15px] tracking-[1px]">1. Identificação do aluno</h4>
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-5 gap-y-2">
          {identification.map(([dt, dd]) => (
            <div key={dt}>
              <dt className="text-[13px] text-ink-quiet">{dt}</dt>
              <dd className="m-0 font-semibold">{dd || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
      {sections.map((s, i) => (
        <section key={s.title} className="flex flex-col gap-2">
          <h4 className="text-[15px] tracking-[1px]">{i + 2}. {s.title}</h4>
          {s.paragraphs?.map((p) => <p key={p} className="m-0">{p}</p>)}
          {s.intro && <p className="m-0">{s.intro}</p>}
          {s.items && (
            <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
              {s.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          )}
        </section>
      ))}
    </article>
  )
}
