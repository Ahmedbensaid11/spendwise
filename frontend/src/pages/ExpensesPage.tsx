import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownUp, ArrowLeft, CalendarDays, ChevronDown, Pencil, Plus, Search, Trash2, Wallet, X } from 'lucide-react'
import { ExpenseForm } from '../components/ExpenseForm'
import { useExpenses } from '../hooks/useExpenses'
import type { Expense, ExpenseFilters, ExpenseInput } from '../types/expense'
import { currencyCode, formatTnd } from '../utils/expenseFormat'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../context/ToastContext'
import { ThemeToggle } from '../components/ThemeToggle'

const initialFilters: ExpenseFilters = { search: '', category: '', from: '', to: '', sort: 'date', direction: 'desc' }
function displayDate(value: string) { return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) }

export function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | undefined>()
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const { categories } = useCategories()
  const { notify } = useToast()
  const { expenses, loading, error, refresh, save, remove } = useExpenses(filters)
  function updateFilter<K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) { setFilters((current) => ({ ...current, [key]: value })) }
  function startCreate() { setEditing(undefined); setActionError(''); setFormOpen(true) }
  function startEdit(expense: Expense) { setEditing(expense); setActionError(''); setFormOpen(true) }
  async function saveExpense(input: ExpenseInput) {
    setBusy(true)
    try { await save(input, editing?.id); setFormOpen(false); setEditing(undefined); notify(editing ? 'Expense updated.' : 'Expense added.') }
    finally { setBusy(false) }
  }
  async function deleteExpense(expense: Expense) {
    if (!window.confirm(`Delete “${expense.description}”? This cannot be undone.`)) return
    setActionError('')
    try { await remove(expense.id); notify('Expense deleted.') }
    catch { setActionError('Could not delete this expense. Please try again.'); notify('Could not delete this expense. Please try again.', 'error') }
  }
  function clearFilters() { setFilters(initialFilters) }

  return <main className="expenses-page"><header className="expenses-topbar"><Link className="brand" to="/dashboard"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link><div className="simple-topbar-actions"><ThemeToggle/><Link className="back-link" to="/dashboard"><ArrowLeft size={15}/> Dashboard</Link></div></header><div className="expenses-content">
    <div className="expenses-heading"><div><span className="eyebrow">YOUR FINANCES</span><h1>Expenses</h1><p>Keep track of where your money goes.</p></div><button className="primary-btn" onClick={startCreate}><Plus size={16}/> Add expense</button></div>
    {formOpen && <section className="expense-editor"><div className="expense-editor-heading"><div><h2>{editing?'Edit expense':'Add an expense'}</h2><p>Enter the details for this transaction.</p></div><button className="close-editor" onClick={()=>setFormOpen(false)} aria-label="Close form"><X size={18}/></button></div><ExpenseForm key={editing?.id ?? 'new'} expense={editing} busy={busy} onSave={saveExpense} onCancel={()=>setFormOpen(false)}/></section>}
    <section className="expense-table-panel"><div className="expense-panel-heading"><div><h2>All expenses</h2><p>{loading?'Loading…':`${expenses.length} ${expenses.length===1?'transaction':'transactions'}`}</p></div><label className="sort-control"><ArrowDownUp size={14}/><select aria-label="Sort expenses" value={`${filters.sort}-${filters.direction}`} onChange={(event)=>{const [sort,direction]=event.target.value.split('-') as [ExpenseFilters['sort'],ExpenseFilters['direction']];updateFilter('sort',sort);updateFilter('direction',direction)}}><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="amount-desc">Highest amount</option><option value="amount-asc">Lowest amount</option></select><ChevronDown size={13}/></label></div>
      <div className="expense-filters"><label className="search-box"><Search size={16}/><input value={filters.search} onChange={(event)=>updateFilter('search',event.target.value)} placeholder="Search expenses…" aria-label="Search expenses"/></label><label className="filter-control"><select value={filters.category} onChange={(event)=>updateFilter('category',event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((category)=><option key={category.id}>{category.name}</option>)}</select><ChevronDown size={13}/></label><label className="date-filter"><CalendarDays size={14}/><input type="date" aria-label="From date" value={filters.from} onChange={(event)=>updateFilter('from',event.target.value)}/></label><span className="date-separator">to</span><label className="date-filter"><CalendarDays size={14}/><input type="date" aria-label="To date" value={filters.to} onChange={(event)=>updateFilter('to',event.target.value)}/></label><button className="clear-filters" onClick={clearFilters}>Clear</button></div>
      {(error||actionError)&&<div className="expense-error-banner" role="alert">{error||actionError}{error&&<button onClick={()=>void refresh()}>Retry</button>}</div>}
      <div className="expense-table-wrap"><table className="expense-table"><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th className="amount-cell">AMOUNT</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{loading?<tr><td colSpan={5} className="expense-empty">Loading your expenses…</td></tr>:expenses.length===0?<tr><td colSpan={5} className="expense-empty"><span className="empty-icon"><Wallet size={20}/></span><strong>{filters.search||filters.category||filters.from||filters.to?'No matching expenses':'No expenses yet'}</strong><span>{filters.search||filters.category||filters.from||filters.to?'Try changing or clearing your filters.':'Add your first expense to start tracking your spending.'}</span>{!filters.search&&!filters.category&&!filters.from&&!filters.to&&<button className="empty-add" onClick={startCreate}><Plus size={14}/> Add your first expense</button>}</td></tr>:expenses.map((expense)=><tr key={expense.id}><td><div className="expense-description"><span className="expense-category-icon" aria-hidden="true"><Wallet size={14} style={{color:categories.find((category)=>category.name===expense.category)?.color??'#619477'}}/></span><strong>{expense.description}</strong></div></td><td><span className="expense-category-tag">{expense.category}</span></td><td className="expense-date-cell">{displayDate(expense.date)}</td><td className="amount-cell"><strong>{formatTnd(expense.amount)} <small>{currencyCode()}</small></strong></td><td><div className="row-actions"><button onClick={()=>startEdit(expense)} aria-label={`Edit ${expense.description}`} title="Edit"><Pencil size={15}/></button><button onClick={()=>void deleteExpense(expense)} aria-label={`Delete ${expense.description}`} title="Delete"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>
    </section><p className="expenses-footnote">Amounts are shown in your selected currency ({currencyCode()}).</p>
  </div></main>
}
