import { Suspense, lazy, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { RecentExpenses } from '../components/dashboard/RecentExpenses'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'

const SpendingCharts = lazy(() => import('../components/dashboard/SpendingCharts')
  .then((module) => ({ default: module.SpendingCharts })))

function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data, loading, error, refresh } = useDashboard()
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

  return <div className="dashboard-shell">
    <DashboardSidebar open={menuOpen} onClose={() => setMenuOpen(false)}/>
    <div className="main-area">
      <DashboardHeader menuOpen={menuOpen} onMenuClick={()=>setMenuOpen((open)=>!open)}/>
      <main className="dashboard-content" id="overview">
        <div className="page-heading"><div><span className="eyebrow">{today.toUpperCase()}</span><h1>{greeting()}, {user?.name?.split(' ')[0]}</h1><p>Here’s what’s happening with your money today.</p></div><button className="add-expense" onClick={()=>navigate('/expenses')}><Plus size={17}/> Add expense</button></div>
        {error&&<div className="dashboard-error" role="alert">{error}<button onClick={()=>void refresh()}>Retry</button></div>}
        {loading&&!data?<div className="dashboard-loading">Loading your financial overview…</div>:data&&<><SummaryCards data={data}/><Suspense fallback={<div className="chart-empty">Loading charts…</div>}><SpendingCharts data={data}/></Suspense><RecentExpenses expenses={data.recentExpenses}/></>}
        <footer className="dashboard-footer">SpendWise <span>·</span> A little more clarity, every day.</footer>
      </main>
    </div>
  </div>
}
