import { useEffect, useState, type FormEvent } from 'react'
import type { Expense, ExpenseInput } from '../types/expense'
import { currencyCode, todayIsoDate } from '../utils/expenseFormat'
import { useCategories } from '../hooks/useCategories'

export function ExpenseForm({ expense, busy, onSave, onCancel }: {
  expense?: Expense
  busy: boolean
  onSave: (input: ExpenseInput) => Promise<void>
  onCancel: () => void
}) {
  const [error, setError] = useState('')
  const { categories, loading: categoriesLoading } = useCategories()
  const [category, setCategory] = useState(expense?.category ?? '')
  useEffect(() => { if (!category && categories.length) setCategory(categories[0].name) }, [categories, category])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const amount = Number(values.get('amount'))
    if (!Number.isFinite(amount) || amount <= 0) { setError('Enter an amount greater than zero.'); return }
    const description = String(values.get('description')).trim()
    if (!description) { setError('Add a short description for this expense.'); return }
    if (description.length > 200) { setError('Keep the description under 200 characters.'); return }
    const date = String(values.get('date'))
    if (!date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) { setError('Choose a valid expense date.'); return }
    if (!String(values.get('category'))) { setError('Choose a category for this expense.'); return }
    const input: ExpenseInput = {
      amount,
      description,
      category: String(values.get('category')),
      date,
    }
    try { setError(''); await onSave(input) }
    catch { setError('Could not save this expense. Please try again.') }
  }
  return <form className="expense-form" onSubmit={submit}>
    <div className="expense-form-grid">
      <label>Amount <span className="input-suffix"><input name="amount" type="number" min="0.001" step="0.001" defaultValue={expense?.amount ?? ''} placeholder="0.000" required/><b>{currencyCode()}</b></span></label>
      <label>Description <input name="description" maxLength={200} defaultValue={expense?.description ?? ''} placeholder="What did you spend on?" required/></label>
      <label>Category <select name="category" value={category} onChange={(event)=>setCategory(event.target.value)} required disabled={categoriesLoading||categories.length===0}><option value="" disabled>Select a category</option>{categories.map((item)=><option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
      <label>Date <input name="date" type="date" defaultValue={expense?.date ?? todayIsoDate()} required/></label>
    </div>
    {error && <p className="expense-error" role="alert">{error}</p>}
    <div className="expense-form-actions"><button type="button" className="secondary-btn" onClick={onCancel} disabled={busy}>Cancel</button><button className="primary-btn" disabled={busy}>{busy?'Saving…':expense?'Save changes':'Save expense'}</button></div>
  </form>
}
