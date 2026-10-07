import { ArrowUpRight, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Expense } from '../../types/expense'
import { currencyCode, formatTnd } from '../../utils/expenseFormat'

function dateLabel(value:string) { return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${value}T00:00:00`)) }
export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  return <section className="panel transactions-panel"><div className="panel-heading"><div><h2>Recent expenses</h2><p>Your latest recorded spending</p></div><Link className="text-btn" to="/expenses">View all <ArrowUpRight size={14}/></Link></div>{expenses.length===0?<div className="recent-empty"><Wallet size={18}/><span>No expenses yet.</span><Link to="/expenses">Add your first expense</Link></div>:<div className="transaction-list">{expenses.map((expense)=><div className="transaction-row" key={expense.id}><div className="transaction-icon green"><Wallet size={15}/></div><div className="transaction-name"><strong>{expense.description}</strong><span>{expense.category}</span></div><span className="transaction-date">{dateLabel(expense.date)}</span><strong className="transaction-amount">{formatTnd(expense.amount)} <small>{currencyCode()}</small></strong></div>)}</div>}</section>
}
