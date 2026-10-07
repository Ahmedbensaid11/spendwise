export type User = { id: number; name: string; email: string }
export type AuthResponse = { token: string; user: User }
export type AuthContextValue = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => void
  updateAccount: (response: AuthResponse) => void
}
