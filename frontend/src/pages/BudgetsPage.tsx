import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, Wallet, X } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { budgetService } from '../services/budgetService'
import type { Budget, BudgetInput } from '../types/budget'
import { currencyCode, formatTnd } from '../utils/expenseFormat'
import { getApiError } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import { ThemeToggle } from '../components/ThemeToggle'

const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December']
function BudgetEditor({ budget, month, year, saving, onSubmit, onCancel }: { budget?:Budget;month:number;year:number;saving:boolean;onSubmit:(input:BudgetInput)=>Promise<void>;onCancel:()=>void }) {
  const {categories}=useCategories()
  async function submit(event:FormEvent<HTMLFormElement>) { event.preventDefault();const form=new FormData(event.currentTarget);const categoryValue=String(form.get('categoryId'));await onSubmit({amount:Number(form.get('amount')),month:Number(form.get('month')),year:Number(form.get('year')),categoryId:categoryValue?Number(categoryValue):null}) }
  return <form className="budget-editor-form" onSubmit={submit}><label>Budget amount<span className="input-suffix"><input name="amount" type="number" min="0.001" step="0.001" required defaultValue={budget?.amount??''} placeholder="0.000"/><b>{currencyCode()}</b></span></label><label>Budget for<select name="categoryId" defaultValue={budget?.categoryId??''}><option value="">Entire month</option>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Month<select name="month" defaultValue={budget?.month??month}>{monthNames.map((name,index)=><option key={name} value={index+1}>{name}</option>)}</select></label><label>Year<input name="year" type="number" min="2000" max="2100" defaultValue={budget?.year??year} required/></label><div className="budget-editor-actions"><button type="button" className="secondary-btn" onClick={onCancel} disabled={saving}>Cancel</button><button className="primary-btn" disabled={saving}>{saving?'Saving…':budget?'Save changes':'Create budget'}</button></div></form>
}

export function BudgetsPage() {
  const { notify } = useToast()
  const today=new Date()
  const [period,setPeriod]=useState({month:today.getMonth()+1,year:today.getFullYear()})
  const [budgets,setBudgets]=useState<Budget[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [editing,setEditing]=useState<Budget|undefined>()
  const [formOpen,setFormOpen]=useState(false)
  const [saving,setSaving]=useState(false)
  const load=useCallback(async()=>{setLoading(true);setError('');try{setBudgets(await budgetService.list(period.year,period.month))}catch{setError('Could not load budgets. Check your connection and try again.')}finally{setLoading(false)}},[period.month,period.year])
  useEffect(()=>{void load()},[load])
  async function submit(input:BudgetInput){setSaving(true);setError('');try{if(editing)await budgetService.update(editing.id,input);else await budgetService.create(input);setFormOpen(false);setEditing(undefined);setPeriod({month:input.month,year:input.year});if(input.month===period.month&&input.year===period.year)await load();notify(editing?'Budget updated.':'Budget created.')}catch(cause){const message=getApiError(cause);setError(message);notify(message,'error')}finally{setSaving(false)}}
  async function remove(budget:Budget){if(!window.confirm('Delete this budget?'))return;setError('');try{await budgetService.remove(budget.id);await load();notify('Budget deleted.')}catch(cause){const message=getApiError(cause);setError(message);notify(message,'error')}}
  const statusLabel={NORMAL:'On track',WARNING:'Near limit',EXCEEDED:'Over budget'}
  return <main className="management-page"><header className="management-topbar"><Link className="brand" to="/dashboard"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link><div className="simple-topbar-actions"><ThemeToggle/><Link className="back-link" to="/dashboard"><ArrowLeft size={15}/> Dashboard</Link></div></header><div className="management-content"><div className="management-heading"><div><span className="eyebrow">PLAN YOUR MONTH</span><h1>Budgets</h1><p>Set a spending limit for the month or for a category.</p></div><button className="primary-btn" onClick={()=>{setEditing(undefined);setError('');setFormOpen(true)}}><Plus size={16}/> Add budget</button></div>
    <div className="budget-period"><label>Showing budgets for<select value={period.month} onChange={(event)=>setPeriod(current=>({...current,month:Number(event.target.value)}))}>{monthNames.map((name,index)=><option key={name} value={index+1}>{name}</option>)}</select></label><input aria-label="Budget year" type="number" min="2000" max="2100" value={period.year} onChange={(event)=>setPeriod(current=>({...current,year:Number(event.target.value)}))}/></div>
    {error&&<div className="management-error" role="alert">{error}<button onClick={()=>void load()}>Retry</button></div>}
    {formOpen&&<section className="management-form-panel"><div className="management-form-heading"><div><h2>{editing?'Edit budget':'New budget'}</h2><p>Choose a monthly limit and an optional category.</p></div><button onClick={()=>setFormOpen(false)} aria-label="Close form"><X size={17}/></button></div><BudgetEditor key={editing?.id??'new'} budget={editing} month={period.month} year={period.year} saving={saving} onSubmit={submit} onCancel={()=>setFormOpen(false)}/></section>}
    {loading?<div className="management-empty">Loading budgets…</div>:budgets.length===0?<section className="management-empty empty-panel"><span className="empty-icon"><Wallet size={20}/></span><strong>No budgets for {monthNames[period.month-1]} {period.year}</strong><span>Create a monthly or category budget to track your progress.</span><button className="empty-add" onClick={()=>{setEditing(undefined);setFormOpen(true)}}><Plus size={14}/> Add your first budget</button></section>:<section className="budget-list">{budgets.map((budget)=><article className="budget-card" key={budget.id}><div className="budget-card-head"><div><span className="budget-kind">{budget.categoryName??'MONTHLY BUDGET'}</span><h2>{formatTnd(budget.amount)} <small>{currencyCode()}</small></h2></div><span className={`budget-status ${budget.status.toLowerCase()}`}>{statusLabel[budget.status]}</span></div><div className="budget-progress"><div><span>Spent <b>{formatTnd(budget.spent)} {currencyCode()}</b></span><span>{budget.percentage}%</span></div><div className="progress-track"><i className={budget.status.toLowerCase()} style={{width:`${Math.min(100,budget.percentage)}%`}}/></div><span className="budget-left">{budget.remaining>=0?`${formatTnd(budget.remaining)} ${currencyCode()} remaining`:`${formatTnd(Math.abs(budget.remaining))} ${currencyCode()} over budget`}</span></div><div className="budget-card-actions"><button onClick={()=>{setEditing(budget);setError('');setFormOpen(true)}}><Pencil size={14}/> Edit</button><button onClick={()=>void remove(budget)}><Trash2 size={14}/> Delete</button></div></article>)}</section>}</div></main>
}
