import { createContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '../services/authService'
import type { AuthContextValue, AuthResponse, User } from '../types/auth'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('spendwise-token'))
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    if (!token) { setUser(null); return }
    authService.currentUser().then(setUser).catch(() => {
      localStorage.removeItem('spendwise-token')
      setToken(null)
    })
  }, [token])

  function accept(response: AuthResponse) {
    localStorage.setItem('spendwise-token', response.token)
    setUser(response.user)
    setToken(response.token)
  }
  function updateAccount(response: AuthResponse) { accept(response) }
  async function login(email: string, password: string) { accept(await authService.login(email, password)) }
  async function register(name: string, email: string, password: string, confirmation: string) {
    accept(await authService.register(name, email, password, confirmation))
  }
  function logout() {
    localStorage.removeItem('spendwise-token')
    setToken(null)
    setUser(null)
  }
  return <AuthContext.Provider value={{ user, token, login, register, logout, updateAccount }}>{children}</AuthContext.Provider>
}
