import { api } from './api'
import type { AuthResponse, User } from '../types/auth'

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  },
  async register(name: string, email: string, password: string, passwordConfirmation: string) {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password, passwordConfirmation })
    return data
  },
  async currentUser() {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
  async updateProfile(name: string, email: string) {
    const { data } = await api.put<AuthResponse>('/auth/me/profile', { name, email })
    return data
  },
  async changePassword(input: { currentPassword: string; newPassword: string; passwordConfirmation: string }) {
    await api.put('/auth/me/password', input)
  },
}
