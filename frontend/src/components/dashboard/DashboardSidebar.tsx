import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ChartNoAxesColumnIncreasing, ChevronDown, CircleHelp, Home, LogOut, Settings, Wallet } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function DashboardSidebar({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  function signOut() { logout(); navigate('/login') }

  return <>
    {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation"/>}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <NavLink className="brand" to="/dashboard" onClick={onClose}><span className="brand-mark"><Wallet size={20}/></span>spendwise</NavLink>
      <div className="workspace-switch"><div className="workspace-avatar">{user?.name?.[0]?.toUpperCase() ?? 'S'}</div><div><strong>Personal space</strong><small>Personal account</small></div><ChevronDown className="workspace-chevron" size={15}/></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="side-nav">
        <NavLink to="/dashboard" end onClick={onClose}><Home size={17}/>Overview</NavLink>
        <NavLink to="/expenses" onClick={onClose}><ArrowDownLeft size={17}/>Expenses</NavLink>
        <NavLink to="/budgets" onClick={onClose}><Wallet size={17}/>Budgets</NavLink>
        <NavLink to="/categories" onClick={onClose}><Settings size={17}/>Categories</NavLink>
        <NavLink to="/statistics" onClick={onClose}><ArrowUpRight size={17}/>Statistics</NavLink>
        <NavLink to="/settings" onClick={onClose}><Settings size={17}/>Settings</NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><ChartNoAxesColumnIncreasing size={16}/></div><strong>Monthly review</strong><p>Review your spending trends and adjust your budget.</p><button onClick={() => navigate('/statistics')}>Open statistics <ArrowUpRight size={13}/></button></div>
        <NavLink className="help-link" to="/help" onClick={onClose}><CircleHelp size={16}/>Help &amp; support</NavLink>
        <button className="profile-row" onClick={signOut}><div className="profile-avatar">{user?.name?.[0]?.toUpperCase() ?? 'A'}</div><span><strong>{user?.name}</strong><small>{user?.email}</small></span><LogOut size={16}/></button>
      </div>
    </aside>
  </>
}
