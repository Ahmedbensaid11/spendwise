import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} title={`Switch to ${dark ? 'light' : 'dark'} mode`}>
    {dark ? <Sun size={17}/> : <Moon size={17}/>}<span>{dark ? 'Light' : 'Dark'} mode</span>
  </button>
}
