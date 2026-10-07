import { AuthForm } from '../components/AuthForm'
export function AuthPage({ mode }: { mode: 'login' | 'register' }) { return <AuthForm mode={mode}/> }
