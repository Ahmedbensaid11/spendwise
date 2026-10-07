import { useCallback, useEffect, useState } from 'react'
import { categoryService } from '../services/categoryService'
import type { Category } from '../types/category'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try { setCategories(await categoryService.list()) }
    catch { setError('Could not load your categories. Check your connection and try again.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  return { categories, loading, error, refresh }
}
