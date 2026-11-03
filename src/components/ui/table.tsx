import * as React from "react"
import { cn } from "cn"

// table/th/td do protótipo: cabeçalho caixa-alta com régua preta de 2px
function Table({
  className,
  minWidth,
  ...props
}: React.ComponentProps<"table"> & { minWidth?: number }) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        style={minWidth ? { minWidth } : undefined}
        className={cn("w-full border-collapse text-[15px]", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader(props: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" {...props} />
}

function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" {...props} />
}

function TableRow(props: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" {...props} />
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "border-b-2 border-ink px-3 py-2.5 text-left text-xs font-semibold tracking-[1px] whitespace-nowrap text-ink-muted uppercase",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("border-b border-line p-3 align-middle", className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }
