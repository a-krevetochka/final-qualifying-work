import { create } from 'zustand'
import type { AuthResponse } from '../types'

interface AuthStore {
  token:    string | null
  user:     AuthResponse | null
  setAuth:  (data: AuthResponse) => void
  logout:   () => void
  isAuth:   () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: localStorage.getItem('token'),
  user:  null,

  setAuth: (data) => {
    localStorage.setItem('token', data.token)
    set({ token: data.token, user: data })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },

  isAuth: () => !!get().token,
}))