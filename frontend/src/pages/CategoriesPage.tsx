import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, Wallet, X } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { categoryService } from '../services/categoryService'
import type { Category } from '../types/category'
import { getApiError } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import { ThemeToggle } from '../components/ThemeToggle'

function CategoryEditor({ category, saving, onSubmit, onCancel }: { category?: Category; saving: boolean; onSubmit: (name:string,color:string)=>Promise<void>; onCancel:()=>void }) {
  async function submit(event:FormEvent<HTMLFormElement>) { event.preventDefault(); const form=new FormData(event.currentTarget); await onSubmit(String(form.get('name')).trim(),String(form.get('color'))) }
  return <form className="category-editor-form" onSubmit={submit}><label>Category name<input name="name" maxLength={60} required defaultValue={category?.name??''} placeholder="e.g. Pets"/></label><label>Color<input name="color" type="color" defaultValue={category?.color??'#619477'}/></label><div><button type="button" className="secondary-btn" onClick={onCancel} disabled={saving}>Cancel</button><button className="primary-btn" disabled={saving}>{saving?'Saving…':category?'Save changes':'Add category'}</button></div></form>
}

export function CategoriesPage() {
  const { categories, loading, error, refresh } = useCategories()
  const { notify } = useToast()
  const [editing, setEditing] = useState<Category|undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  async function submit(name:string,color:string) {
    setSaving(true); setActionError('')
    try { if(editing) await categoryService.update(editing.id,{name,color}); else await categoryService.create({name,color}); setFormOpen(false); setEditing(undefined); await refresh(); notify(editing?'Category updated.':'Category added.') }
    catch(cause) { const message=getApiError(cause); setActionError(message); notify(message,'error') } finally { setSaving(false) }
  }
  async function remove(category:Category) {
    if(!window.confirm(`Delete the “${category.name}” category?`)) return
    setActionError('')
    try { await categoryService.remove(category.id); await refresh(); notify('Category deleted.') } catch(cause) { const message=getApiError(cause); setActionError(message); notify(message,'error') }
  }
  return <main className="management-page"><header className="management-topbar"><Link className="brand" to="/dashboard"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link><div className="simple-topbar-actions"><ThemeToggle/><Link className="back-link" to="/dashboard"><ArrowLeft size={15}/> Dashboard</Link></div></header><div className="management-content"><div className="management-heading"><div><span className="eyebrow">ORGANIZE YOUR SPENDING</span><h1>Categories</h1><p>Group expenses in a way that makes sense to you.</p></div><button className="primary-btn" onClick={()=>{setEditing(undefined);setActionError('');setFormOpen(true)}}><Plus size={16}/> Add category</button></div>
    {actionError&&<div className="management-error" role="alert">{actionError}</div>}{error&&<div className="management-error" role="alert">{error}<button onClick={()=>void refresh()}>Retry</button></div>}
    {formOpen&&<section className="management-form-panel"><div className="management-form-heading"><div><h2>{editing?'Edit category':'New category'}</h2><p>Choose a clear name and color for this category.</p></div><button onClick={()=>setFormOpen(false)} aria-label="Close form"><X size={17}/></button></div><CategoryEditor key={editing?.id??'new'} category={editing} saving={saving} onSubmit={submit} onCancel={()=>setFormOpen(false)}/></section>}
    {loading?<div className="management-empty">Loading categories…</div>:<section className="category-cards">{categories.map((category)=><article className="category-card" key={category.id}><div className="category-card-top"><span className="category-color" style={{background:category.color}}/><span className="category-kind">{category.defaultCategory?'DEFAULT':'CUSTOM'}</span></div><h2>{category.name}</h2><p>Expenses filed under this category</p><div className="category-card-actions"><button onClick={()=>{setEditing(category);setActionError('');setFormOpen(true)}}><Pencil size={14}/> Edit</button><button onClick={()=>void remove(category)} aria-label={`Delete ${category.name}`}><Trash2 size={14}/> Delete</button></div></article>)}</section>}</div></main>
}
