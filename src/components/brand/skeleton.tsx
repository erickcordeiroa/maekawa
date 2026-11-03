/** Placeholder enquanto o conteúdo por requisição chega (streaming) */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="flex animate-pulse flex-col gap-6">
      <div className="h-10 w-64 rounded-md bg-line" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[104px] rounded-xl bg-white" />)}
      </div>
      <div className="h-80 rounded-xl bg-white" />
    </div>
  )
}
