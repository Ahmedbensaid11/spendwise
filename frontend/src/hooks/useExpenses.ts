import { useCallback, useEffect, useState } from 'react'
import { expenseService } from '../services/expenseService'
import type { Expense, ExpenseFilters, ExpenseInput } from '../types/expense'

export function useExpenses(filters: ExpenseFilters) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setExpenses(await expenseService.list(filters)) }
    catch { setError('Could not load expenses. Check that the API is running and try again.') }
    finally { setLoading(false) }
  }, [filters.search, filters.category, filters.from, filters.to, filters.sort, filters.direction])

  useEffect(() => { void refresh() }, [refresh])
  async function save(input: ExpenseInput, id?: number) {
    if (id) await expenseService.update(id, input)
    else await expenseService.create(input)
    await refresh()
  }
  async function remove(id: number) { await expenseService.remove(id); await refresh() }
  return { expenses, loading, error, refresh, save, remove }
}
