import { api } from './api'
import type { Budget, BudgetInput } from '../types/budget'

export const budgetService = {
  async list(year: number, month: number) { const { data } = await api.get<Budget[]>('/budgets', { params: { year, month } }); return data },
  async create(input: BudgetInput) { const { data } = await api.post<Budget>('/budgets', input); return data },
  async update(id: number, input: BudgetInput) { const { data } = await api.put<Budget>(`/budgets/${id}`, input); return data },
  async remove(id: number) { await api.delete(`/budgets/${id}`) },
}
