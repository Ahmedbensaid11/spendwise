import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowUpRight, CircleHelp, ShieldCheck, Wallet } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getApiError } from '../utils/apiError'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register, token } = useAuth()
  const navigate = useNavigate()
  const isRegister = mode === 'register'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const fields = new FormData(event.currentTarget)
    try {
      if (isRegister) await register(String(fields.get('name')), String(fields.get('email')), String(fields.get('password')), String(fields.get('confirmation')))
      else await login(String(fields.get('email')), String(fields.get('password')))
      navigate('/dashboard', { replace: true })
    } catch (cause) { setError(getApiError(cause)) } finally { setBusy(false) }
  }
  if (token) return <Navigate to="/dashboard" replace />
  return <main className="auth-page"><aside className="auth-aside"><Link className="brand brand-light" to="/"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link><div className="aside-copy"><span className="eyebrow">YOUR MONEY, IN FOCUS</span><h1>A clearer view of your financial life.</h1><p>Build better habits with a simple, thoughtful way to track every dinar.</p><div className="aside-card"><div className="aside-card-top"><span>Monthly overview</span><span className="trend"><ArrowUpRight size={14}/> 12.8%</span></div><strong>2,480 <small>TND</small></strong><div className="mini-chart">{Array.from({length:12},(_,i)=><i key={i}/>)}</div><div className="chart-labels"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div></div><span className="aside-note"><ShieldCheck size={15}/> Your financial data stays private and secure.</span></div><div className="aside-footer">A little clarity goes a long way.</div></aside><section className="auth-main"><div className="auth-mobile-brand"><Link className="brand" to="/"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link></div><div className="auth-form-wrap"><div className="auth-heading"><span className="eyebrow">{isRegister?'GET STARTED':'WELCOME BACK'}</span><h2>{isRegister?'Create your account':'Sign in to SpendWise'}</h2><p>{isRegister?'Start building a healthier relationship with your money.':'Enter your details to access your personal dashboard.'}</p></div><form className="auth-form" onSubmit={submit}>{isRegister&&<label>Full name<input name="name" placeholder="e.g. Alex Morgan" autoComplete="name" required maxLength={120}/></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required/></label><label>Password<input name="password" type="password" placeholder={isRegister?'At least 8 characters':'Enter your password'} autoComplete={isRegister?'new-password':'current-password'} minLength={isRegister?8:undefined} required/></label>{isRegister&&<label>Confirm password<input name="confirmation" type="password" placeholder="Repeat your password" autoComplete="new-password" required/></label>}{error&&<div className="form-error" role="alert">{error}</div>}<button className="primary-btn" disabled={busy}>{busy?'Please wait…':isRegister?'Create account':'Sign in'}<ArrowUpRight size={16}/></button></form><p className="auth-switch">{isRegister?'Already have an account?':'New to SpendWise?'} <Link to={isRegister?'/login':'/register'}>{isRegister?'Sign in':'Create an account'}</Link></p><div className="auth-legal">By continuing, you agree to keep your account credentials private.</div></div><div className="auth-bottom"><span>© 2026 SpendWise</span><Link to="/help" className="auth-help-link"><CircleHelp size={14}/> Help center</Link></div></section></main>
}
