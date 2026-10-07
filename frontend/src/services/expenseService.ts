import { api } from './api'
import type { Expense, ExpenseFilters, ExpenseInput } from '../types/expense'

export const expenseService = {
  async list(filters: ExpenseFilters) {
    const { data } = await api.get<Expense[]>('/expenses', { params: {
      search: filters.search || undefined,
      category: filters.category || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      sort: filters.sort,
      direction: filters.direction,
    } })
    return data
  },
  async create(input: ExpenseInput) {
    const { data } = await api.post<Expense>('/expenses', input)
    return data
  },
  async update(id: number, input: ExpenseInput) {
    const { data } = await api.put<Expense>(`/expenses/${id}`, input)
    return data
  },
  async remove(id: number) { await api.delete(`/expenses/${id}`) },
}
