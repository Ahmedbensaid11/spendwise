import { ArrowUpRight, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DashboardData } from '../../types/dashboard'
import { currencyCode, formatTnd } from '../../utils/expenseFormat'

export function SummaryCards({ data }: { data: DashboardData }) {
  const cards = [
    { title: 'Total spent', icon: <Wallet size={17}/>, value: `${formatTnd(data.totalSpent)} ${currencyCode()}`, note: 'Across all recorded expenses', tone: '' },
    { title: 'Spent this month', icon: <ArrowUpRight size={17}/>, value: `${formatTnd(data.monthlySpent)} ${currencyCode()}`, note: 'Current month', tone: 'stat-icon-peach' },
    { title: 'Monthly budget', icon: <Wallet size={17}/>, value: data.monthlyBudget==null?'Not set':`${formatTnd(data.monthlyBudget)} ${currencyCode()}`, note: data.monthlyBudget==null?'':'Your monthly spending limit', tone: 'stat-icon-green' },
    { title: 'Remaining', icon: <Wallet size={17}/>, value: data.remaining==null?'Not set':`${formatTnd(data.remaining)} ${currencyCode()}`, note: data.remaining==null?'':'Available this month', tone: 'stat-icon-green' },
  ]
  return <section className="stats-grid">{cards.map((card)=><article className="stat-card" key={card.title}><div className="stat-top"><span>{card.title}</span><span className={`stat-icon ${card.tone}`}>{card.icon}</span></div><strong>{card.value}</strong>{card.title==='Monthly budget'&&data.monthlyBudget!==null&&data.monthlyBudget!==undefined?<div className="budget-foot"><div className="progress-track"><i style={{width:`${Math.min(100,Math.max(0,data.monthlySpent/data.monthlyBudget*100))}%`}}/></div><span>{formatTnd(data.monthlySpent)} spent <b><Link to="/budgets">Manage</Link></b></span></div>:card.title==='Monthly budget'&&data.monthlyBudget==null?<div className="stat-foot"><Link className="budget-setup-link" to="/budgets">Set a monthly budget</Link></div>:<div className="stat-foot">{card.note}</div>}</article>)}</section>
}
