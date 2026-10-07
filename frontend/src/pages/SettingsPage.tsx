import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, LogOut, Moon, ShieldCheck, UserRound, Wallet } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import { usePreferences, type CurrencyCode } from '../context/PreferencesContext'
import { useToast } from '../context/ToastContext'
import { authService } from '../services/authService'
import { getApiError } from '../utils/apiError'

export function SettingsPage() {
  const { user, updateAccount, logout } = useAuth()
  const { currency, setCurrency } = usePreferences()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    if (!name) { setProfileError('Enter your name before saving.'); return }
    if (!email) { setProfileError('Enter your email address before saving.'); return }
    setSavingProfile(true)
    setProfileError('')
    try {
      updateAccount(await authService.updateProfile(name, email))
      notify('Profile updated.')
    } catch (cause) {
      const message = getApiError(cause)
      setProfileError(message)
      notify(message, 'error')
    } finally { setSavingProfile(false) }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const currentPassword = String(form.get('currentPassword') ?? '')
    const newPassword = String(form.get('newPassword') ?? '')
    const passwordConfirmation = String(form.get('passwordConfirmation') ?? '')
    if (newPassword !== passwordConfirmation) { setPasswordError('The new passwords do not match.'); return }
    if (newPassword === currentPassword) { setPasswordError('Choose a password different from your current one.'); return }
    setSavingPassword(true)
    setPasswordError('')
    try {
      await authService.changePassword({ currentPassword, newPassword, passwordConfirmation })
      formElement.reset()
      notify('Password changed successfully.')
    } catch (cause) {
      const message = getApiError(cause)
      setPasswordError(message)
      notify(message, 'error')
    } finally { setSavingPassword(false) }
  }

  function signOut() { logout(); navigate('/login') }

  return <main className="settings-page"><header className="settings-topbar"><Link className="brand" to="/dashboard"><span className="brand-mark"><Wallet size={20}/></span>spendwise</Link><div className="simple-topbar-actions"><ThemeToggle/><Link className="back-link" to="/dashboard"><ArrowLeft size={15}/> Dashboard</Link></div></header>
    <div className="settings-content"><div className="settings-heading"><span className="eyebrow">ACCOUNT PREFERENCES</span><h1>Settings</h1><p>Manage your profile, display preferences, and account security.</p></div>
      <section className="settings-card"><div className="settings-section-title"><span className="settings-section-icon"><UserRound size={17}/></span><div><h2>Profile</h2><p>Your account details</p></div></div><form className="settings-form profile-form" onSubmit={saveProfile}><label>Full name<input name="name" autoComplete="name" maxLength={120} defaultValue={user?.name ?? ''} required/></label><label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} defaultValue={user?.email ?? ''} required/><small>Changing your email updates the address used to sign in.</small></label>{profileError&&<p className="settings-error" role="alert">{profileError}</p>}<div className="settings-form-actions"><button className="primary-btn" disabled={savingProfile}>{savingProfile?'Saving…':'Save profile'}</button></div></form></section>

      <section className="settings-card"><div className="settings-section-title"><span className="settings-section-icon"><Moon size={17}/></span><div><h2>Preferences</h2><p>Choose how SpendWise looks and labels amounts</p></div></div><div className="settings-preference-row"><div><strong>Appearance</strong><span>Use a comfortable theme across your workspace.</span></div><ThemeToggle/></div><div className="settings-preference-row currency-row"><label htmlFor="currency-setting"><strong>Currency</strong><span>Choose the unit shown for amounts and summaries.</span></label><select id="currency-setting" value={currency} onChange={(event)=>setCurrency(event.target.value as CurrencyCode)}><option value="TND">TND — Tunisian dinar</option><option value="EUR">EUR — Euro</option><option value="USD">USD — US dollar</option></select></div><p className="settings-note">Currency changes update the unit label only; amounts are not converted. Keep all records in one currency for meaningful totals.</p></section>

      <section className="settings-card"><div className="settings-section-title"><span className="settings-section-icon"><ShieldCheck size={17}/></span><div><h2>Security</h2><p>Keep your account protected</p></div></div><form className="settings-form password-form" onSubmit={savePassword}><label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required/></label><label>New password<input name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={72} required/><small>Use at least 8 characters.</small></label><label>Confirm new password<input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} maxLength={72} required/></label>{passwordError&&<p className="settings-error" role="alert">{passwordError}</p>}<div className="settings-form-actions"><button className="primary-btn" disabled={savingPassword}><KeyRound size={14}/>{savingPassword?'Updating…':'Change password'}</button></div></form><div className="settings-signout"><div><strong>Sign out</strong><span>End this session on this device.</span></div><button className="secondary-btn" onClick={signOut}><LogOut size={14}/> Sign out</button></div></section>
      <p className="settings-footer">Changes to your profile and password are saved to your account. Appearance and currency preferences are stored on this device.</p>
    </div>
  </main>
}
