import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

const ThemeContext = createContext<ThemeContextValue | null>(null)

function savedTheme(): Theme {
  return localStorage.getItem('spendwise-theme') === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(savedTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('spendwise-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((current) => current === 'light' ? 'dark' : 'light')
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}
