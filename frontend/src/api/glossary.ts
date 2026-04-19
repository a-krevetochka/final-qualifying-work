import client from './client'
import type { GlossaryTerm } from '../types'

export const getGlossary = (category?: string, q?: string) => {
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (q)        params.append('q', q)
  return client.get<GlossaryTerm[]>(`/glossary?${params.toString()}`).then(r => r.data)
}