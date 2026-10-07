import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'

export function ComingSoonPage({ title }: { title: string }) {
  return <main className="coming-soon"><Link className="brand" to="/dashboard"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link><div><span className="eyebrow">SPENDWISE WORKSPACE</span><h1>{title}</h1><p>This section is planned for a later sprint. Your account is ready; this feature is still being built.</p><Link className="primary-btn" to="/dashboard">Back to overview</Link></div></main>
}
