import client from './client'
import type { ScreenerResult } from '../types'

export interface ScreenerFilter {
  sector?: string
  peMax?: number
  divMin?: number
  signal?: string
  sort?: string
  page?: number
  size?: number
}

export interface ScreenerPage {
  total:   number
  page:    number
  size:    number
  results: ScreenerResult[]
}

export const screenStocks = (filter: ScreenerFilter) => {
  const params = new URLSearchParams()
  if (filter.sector)  params.append('sector', filter.sector)
  if (filter.peMax)   params.append('peMax', filter.peMax.toString())
  if (filter.divMin)  params.append('divMin', filter.divMin.toString())
  if (filter.sort)    params.append('sort', filter.sort)
  params.append('page', (filter.page ?? 0).toString())
  params.append('size', (filter.size ?? 20).toString())

  return client.get<ScreenerPage>(`/screener?${params.toString()}`).then(r => r.data)
}

