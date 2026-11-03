export const TRANSACTION_KINDS = ["entrada", "saida"] as const
export type TransactionKind = (typeof TRANSACTION_KINDS)[number]

export const INCOME_CATEGORIES = ["Mensalidades", "Venda de kimonos e faixas", "Matrículas", "Aulas particulares"]
export const EXPENSE_CATEGORIES = ["Aluguel", "Professores auxiliares", "Energia e água", "Materiais e limpeza", "Marketing"]

export const PERIODS = [3, 6, 12] as const
export type Period = (typeof PERIODS)[number]
