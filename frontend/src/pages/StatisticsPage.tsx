import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUpRight, ChartNoAxesColumnIncreasing, CircleDollarSign, ReceiptText, RotateCw } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { categoryService } from '../services/categoryService'
import { expenseService } from '../services/expenseService'
import type { Category } from '../types/category'
import type { Expense, ExpenseFilters } from '../types/expense'
import { currencyCode, formatTnd } from '../utils/expenseFormat'

type Period = '6' | '12' | 'all'
type MonthlyTotal = { key: string; month: string; amount: number }
type CategoryTotal = { category: string; amount: number; color: string; percentage: number }

const filters: ExpenseFilters = { search: '', category: '', from: '', to: '', sort: 'date', direction: 'desc' }
const fallbackColors = ['#619477', '#7593aa', '#e7a17a', '#9a82b7', '#da8c9a', '#d0a65d', '#8e9ab0']
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' })

function monthKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` }
function amountOf(expense: Expense) { const amount = Number(expense.amount); return Number.isFinite(amount) ? amount : 0 }

function buildMonthlyTotals(expenses: Expense[], start: Date, end: Date): MonthlyTotal[] {
  const totals = new Map<string, number>()
  for (const expense of expenses) {
    const date = new Date(`${expense.date}T00:00:00`)
    const key = monthKey(date)
    totals.set(key, (totals.get(key) ?? 0) + amountOf(expense))
  }
  const result: MonthlyTotal[] = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  const last = new Date(end.getFullYear(), end.getMonth(), 1)
  while (cursor <= last) {
    const key = monthKey(cursor)
    result.push({ key, month: monthFormatter.format(cursor), amount: totals.get(key) ?? 0 })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return result
}

function displayPeriod(period: Period) {
  if (period === 'all') return 'All recorded time'
  return `Last ${period} months`
}

export function StatisticsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [period, setPeriod] = useState<Period>('6')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [expenseData, categoryData] = await Promise.all([expenseService.list(filters), categoryService.list()])
      setExpenses(expenseData)
      setCategories(categoryData)
    } catch {
      setError('We could not load your statistics. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const report = useMemo(() => {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const datedExpenses = expenses.filter((expense) => !Number.isNaN(new Date(`${expense.date}T00:00:00`).getTime()))
    const earliestExpense = datedExpenses.reduce<Date | null>((earliest, expense) => {
      const date = new Date(`${expense.date}T00:00:00`)
      return !earliest || date < earliest ? date : earliest
    }, null)
    const start = period === 'all'
      ? earliestExpense ? new Date(earliestExpense.getFullYear(), earliestExpense.getMonth(), 1) : currentMonth
      : new Date(now.getFullYear(), now.getMonth() - Number(period) + 1, 1)
    const selected = datedExpenses.filter((expense) => {
      const date = new Date(`${expense.date}T00:00:00`)
      return date >= start && date <= now
    })
    const monthly = buildMonthlyTotals(selected, start, currentMonth)
    const total = selected.reduce((sum, expense) => sum + amountOf(expense), 0)
    const largest = selected.reduce<Expense | null>((biggest, expense) => !biggest || amountOf(expense) > amountOf(biggest) ? expense : biggest, null)
    const categoryTotals = new Map<string, number>()
    selected.forEach((expense) => categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + amountOf(expense)))
    const categoryColor = new Map(categories.map((category) => [category.name, category.color]))
    const byCategory: CategoryTotal[] = [...categoryTotals.entries()]
      .map(([category, amount], index) => ({ category, amount, color: categoryColor.get(category) ?? fallbackColors[index % fallbackColors.length], percentage: total ? Math.round(amount / total * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount)
    const months = Math.max(1, monthly.length)
    return { selected, monthly, total, average: selected.length ? total / months : 0, largest, byCategory, topCategory: byCategory[0] ?? null, months }
  }, [categories, expenses, period])

  const hasData = report.selected.length > 0
  const tooltipFormatter = (value: unknown) => `${formatTnd(Number(value ?? 0))} ${currencyCode()}`

  return <div className="dashboard-shell">
    <DashboardSidebar open={menuOpen} onClose={() => setMenuOpen(false)}/>
    <div className="main-area">
      <DashboardHeader menuOpen={menuOpen} onMenuClick={() => setMenuOpen((open) => !open)} title="Statistics"/>
      <main className="dashboard-content statistics-content">
        <div className="page-heading statistics-heading">
          <div><span className="eyebrow">YOUR MONEY, IN PERSPECTIVE</span><h1>Statistics</h1><p>Understand your spending patterns over time.</p></div>
          <div className="statistics-actions"><label className="period-select"><span>Period</span><select value={period} onChange={(event) => setPeriod(event.target.value as Period)} aria-label="Statistics period"><option value="6">Last 6 months</option><option value="12">Last 12 months</option><option value="all">All time</option></select></label></div>
        </div>

        {error && <div className="dashboard-error" role="alert">{error}<button onClick={() => void load()}><RotateCw size={13}/> Retry</button></div>}
        {loading && !expenses.length ? <div className="statistics-state" role="status"><span className="statistics-spinner"/>Loading your statistics…</div> : !error && !hasData ? <section className="statistics-empty"><span className="empty-icon"><ChartNoAxesColumnIncreasing size={20}/></span><h2>No expenses in this period</h2><p>Add an expense to see your spending trends and category breakdown.</p><button className="primary-btn" onClick={() => navigate('/expenses')}>Add an expense</button></section> : !error && <>
          <div className="statistics-period-note">Showing {displayPeriod(period).toLowerCase()} · {report.selected.length} {report.selected.length === 1 ? 'expense' : 'expenses'}</div>
          <section className="statistics-metrics" aria-label="Spending summary">
            <article className="statistics-metric"><span className="metric-icon green"><CircleDollarSign size={17}/></span><span className="metric-label">Total spending</span><strong>{formatTnd(report.total)} <small>{currencyCode()}</small></strong><p>For {displayPeriod(period).toLowerCase()}</p></article>
            <article className="statistics-metric"><span className="metric-icon blue"><ChartNoAxesColumnIncreasing size={17}/></span><span className="metric-label">Monthly average</span><strong>{formatTnd(report.average)} <small>{currencyCode()}</small></strong><p>Across {report.months} {report.months === 1 ? 'month' : 'months'}</p></article>
            <article className="statistics-metric"><span className="metric-icon orange"><ArrowUpRight size={17}/></span><span className="metric-label">Largest expense</span><strong>{formatTnd(report.largest ? amountOf(report.largest) : 0)} <small>{currencyCode()}</small></strong><p className="metric-caption">{report.largest?.description ?? 'No expense recorded'}</p></article>
            <article className="statistics-metric"><span className="metric-icon purple"><ReceiptText size={17}/></span><span className="metric-label">Top category</span><strong className="metric-category">{report.topCategory?.category ?? '—'}</strong><p>{report.topCategory ? `${formatTnd(report.topCategory.amount)} ${currencyCode()} · ${report.topCategory.percentage}%` : 'No category data'}</p></article>
          </section>

          <section className="statistics-chart-grid" aria-label="Spending charts">
            <article className="panel statistics-chart-card"><div className="panel-heading"><div><h2>Monthly spending</h2><p>Amount spent each month · {currencyCode()}</p></div><span className="chart-icon"><ArrowDown size={15}/></span></div><div className="statistics-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.monthly} margin={{ top: 14, right: 8, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 9 }} tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)} width={38}/><Tooltip formatter={tooltipFormatter}/><Bar dataKey="amount" name="Spent" fill="#619477" radius={[5, 5, 0, 0]} maxBarSize={42}/></BarChart></ResponsiveContainer></div></article>
            <article className="panel statistics-chart-card"><div className="panel-heading"><div><h2>Spending trend</h2><p>Month-by-month movement · {currencyCode()}</p></div><span className="chart-icon"><ChartNoAxesColumnIncreasing size={15}/></span></div><div className="statistics-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={report.monthly} margin={{ top: 14, right: 12, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 9 }} tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)} width={38}/><Tooltip formatter={tooltipFormatter}/><Line type="monotone" dataKey="amount" name="Spent" stroke="#619477" strokeWidth={3} dot={{ r: 3, fill: '#619477' }} activeDot={{ r: 5 }}/></LineChart></ResponsiveContainer></div></article>
            <article className="panel statistics-chart-card category-breakdown-card"><div className="panel-heading"><div><h2>Spending by category</h2><p>Share of total spending · {displayPeriod(period)}</p></div></div><div className="statistics-category-layout"><div className="statistics-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={report.byCategory} dataKey="amount" nameKey="category" innerRadius="62%" outerRadius="88%" paddingAngle={2}>{report.byCategory.map((item) => <Cell key={item.category} fill={item.color}/>)}</Pie><Tooltip formatter={tooltipFormatter}/></PieChart></ResponsiveContainer><div className="statistics-donut-total"><strong>{formatTnd(report.total)}</strong><span>{currencyCode()} total</span></div></div><div className="statistics-category-list">{report.byCategory.map((item) => <div className="statistics-category-row" key={item.category}><i style={{ background: item.color }}/><span>{item.category}</span><strong>{item.percentage}%</strong><small>{formatTnd(item.amount)} {currencyCode()}</small></div>)}</div></div></article>
          </section>
        </>}
        <footer className="dashboard-footer">SpendWise <span>·</span> A little more clarity, every day.</footer>
      </main>
    </div>
  </div>
}
