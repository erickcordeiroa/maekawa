export function PageHead({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[34px]">{title}</h1>
        <p className="mt-1 text-ink-muted">{description}</p>
      </div>
      {children}
    </div>
  )
}
