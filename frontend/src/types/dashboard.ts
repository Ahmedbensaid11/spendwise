import type { Expense } from './expense'

export type DashboardData = {
  totalSpent: number
  monthlySpent: number
  monthlyBudget: number | null
  remaining: number | null
  month: string
  monthlySpending: { month: string; amount: number }[]
  categorySpending: { category: string; color: string; amount: number; percentage: number }[]
  recentExpenses: Expense[]
}
