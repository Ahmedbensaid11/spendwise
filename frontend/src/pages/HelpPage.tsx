import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BadgeHelp, ChartNoAxesColumnIncreasing, CircleHelp, Wallet } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'

const questions = [
  { question: 'How do I add or change an expense?', answer: 'Open Expenses, select Add expense, complete the amount, description, category, and date, then save. Use the edit and delete controls in the expense list to update a record.' },
  { question: 'How do budgets work?', answer: 'Create a monthly budget for all spending or choose a category. SpendWise compares recorded expenses with that limit and shows whether you are on track, near the limit, or over budget.' },
  { question: 'Why are my statistics empty?', answer: 'Statistics use your saved expenses. Check that the selected period includes their dates, then refresh the page. You can change the period between six months, twelve months, and all time.' },
  { question: 'Can I change my password?', answer: 'Yes. Open Settings, enter your current password, then choose and confirm a new password with at least eight characters.' },
  { question: 'Are amounts converted when I change currency?', answer: 'No. Currency preferences change the unit label only. SpendWise does not convert saved amounts, so keep all records in one currency for accurate totals.' },
]

export function HelpPage() {
  return <main className="help-page"><header className="settings-topbar"><Link className="brand" to="/"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link><div className="simple-topbar-actions"><ThemeToggle/><Link className="back-link" to="/dashboard"><ArrowLeft size={15}/> Dashboard</Link></div></header>
    <div className="help-content"><div className="help-hero"><span className="help-hero-icon"><BadgeHelp size={21}/></span><span className="eyebrow">SPENDWISE SUPPORT</span><h1>How can we help?</h1><p>Quick answers for managing your expenses, budgets, and account.</p></div>
      <div className="help-layout"><section className="help-faq"><h2>Frequently asked questions</h2>{questions.map((item)=><details className="help-question" key={item.question}><summary><CircleHelp size={16}/><span>{item.question}</span><span className="help-expand">+</span></summary><p>{item.answer}</p></details>)}</section>
        <aside className="help-shortcuts"><h2>Quick links</h2><Link to="/expenses"><span><Wallet size={16}/></span><div><strong>Manage expenses</strong><small>Add, edit, search, or filter records</small></div><ArrowRight size={15}/></Link><Link to="/budgets"><span><ChartNoAxesColumnIncreasing size={16}/></span><div><strong>Review budgets</strong><small>Set monthly and category limits</small></div><ArrowRight size={15}/></Link><Link to="/statistics"><span><ChartNoAxesColumnIncreasing size={16}/></span><div><strong>View statistics</strong><small>Explore trends and category totals</small></div><ArrowRight size={15}/></Link><Link to="/settings"><span><CircleHelp size={16}/></span><div><strong>Account settings</strong><small>Update your profile and password</small></div><ArrowRight size={15}/></Link></aside></div>
      <p className="help-note">For account-specific assistance, contact the person who manages your SpendWise instance.</p>
    </div>
  </main>
}
