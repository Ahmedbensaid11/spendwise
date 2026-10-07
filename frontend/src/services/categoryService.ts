import { api } from './api'
import type { Category, CategoryInput } from '../types/category'

export const categoryService = {
  async list() { const { data } = await api.get<Category[]>('/categories'); return data },
  async create(input: CategoryInput) { const { data } = await api.post<Category>('/categories', input); return data },
  async update(id: number, input: CategoryInput) { const { data } = await api.put<Category>(`/categories/${id}`, input); return data },
  async remove(id: number) { await api.delete(`/categories/${id}`) },
}
