import { Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from '../ThemeToggle'

export function DashboardHeader({ menuOpen, onMenuClick, title = 'Overview' }: { menuOpen: boolean; onMenuClick: () => void; title?: string }) {
  const { user } = useAuth()
  return <header className="topbar"><button className="mobile-menu" onClick={onMenuClick} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen?<X/>:<Menu/>}</button><div className="crumb">Workspace <span>/</span> {title}</div><div className="top-actions"><ThemeToggle/><div className="top-avatar">{user?.name?.[0]?.toUpperCase()??'A'}</div></div></header>
}
