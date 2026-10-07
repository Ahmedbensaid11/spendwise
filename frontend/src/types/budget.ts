export type Budget = {
  id: number
  amount: number
  month: number
  year: number
  categoryId: number | null
  categoryName: string | null
  spent: number
  remaining: number
  percentage: number
  status: 'NORMAL' | 'WARNING' | 'EXCEEDED'
}
export type BudgetInput = { amount: number; month: number; year: number; categoryId: number | null }
