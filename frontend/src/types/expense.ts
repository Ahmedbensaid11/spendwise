export type Expense = {
  id: number
  amount: number
  description: string
  date: string
  category: string
  createdAt: string
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>
export type ExpenseFilters = {
  search: string
  category: string
  from: string
  to: string
  sort: 'date' | 'amount'
  direction: 'asc' | 'desc'
}
