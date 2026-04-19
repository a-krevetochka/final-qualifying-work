import client from './client'
import type { AuthResponse, User } from '../types'

export const register = (email: string, username: string, password: string) =>
  client.post<AuthResponse>('/auth/register', { email, username, password }).then(r => r.data)

export const login = (email: string, password: string) =>
  client.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data)

export const getMe = () =>
  client.get<AuthResponse>('/auth/me').then(r => r.data)

export const updateProfile = (username: string) =>
  client.put<User>('/user/profile', { username }).then(r => r.data)

export const updatePassword = (oldPassword: string, newPassword: string) =>
  client.put('/user/password', { oldPassword, newPassword })