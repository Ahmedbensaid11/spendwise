import { Link } from 'react-router-dom'
import { ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react'

export function LandingPage() {
  return <main className="landing-page"><nav className="landing-nav"><Link className="brand" to="/"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link><div><Link to="/help">Help &amp; support</Link><Link to="/login">Log in</Link><Link className="primary-btn" to="/register">Get started <ArrowUpRight size={16}/></Link></div></nav><section className="landing-hero"><span className="eyebrow">PERSONAL FINANCE, MADE CLEAR</span><h1>Take control of<br/>your money.</h1><p>Track your spending, set a budget, and feel more confident about where every dinar goes.</p><div><Link className="primary-btn" to="/register">Get started <ArrowUpRight size={16}/></Link><Link className="landing-login" to="/login">I already have an account</Link></div><div className="landing-preview"><span><ShieldCheck size={18}/></span><div><strong>Spend with intention.</strong><small>A calmer way to manage your everyday finances.</small></div></div></section><footer className="landing-footer">SpendWise <span>·</span> Track · Budget · Understand</footer></main>
}
