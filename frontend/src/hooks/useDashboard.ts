import { useCallback, useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardData } from '../types/dashboard'

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setData(await dashboardService.summary()) }
    catch { setError('We could not load your dashboard. Check your connection and try again.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  return { data, loading, error, refresh }
}
