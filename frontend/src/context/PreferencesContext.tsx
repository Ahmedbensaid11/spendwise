import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type CurrencyCode = 'TND' | 'EUR' | 'USD'
type PreferencesContextValue = { currency: CurrencyCode; setCurrency: (currency: CurrencyCode) => void }
const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function initialCurrency(): CurrencyCode {
  const saved = localStorage.getItem('spendwise-currency')
  return saved === 'EUR' || saved === 'USD' ? saved : 'TND'
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency)
  useEffect(() => { localStorage.setItem('spendwise-currency', currency) }, [currency])
  return <PreferencesContext.Provider value={{ currency, setCurrency }}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used inside PreferencesProvider')
  return value
}
