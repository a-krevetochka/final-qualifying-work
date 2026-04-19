import client from './client'
import type { Favorite } from '../types'

export const getFavorites = () =>
  client.get<Favorite[]>('/favorites').then(r => r.data)

export const addFavorite = (ticker: string) =>
  client.post<Favorite>(`/favorites/${ticker}`).then(r => r.data)

export const removeFavorite = (ticker: string) =>
  client.delete(`/favorites/${ticker}`)