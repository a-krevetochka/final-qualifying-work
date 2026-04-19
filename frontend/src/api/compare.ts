import client from './client'
import type { CompareItem } from '../types'

export interface CompareResult {
  tickers: string[]
  items: CompareItem[]
}

export const compareStocks = (tickers: string[]) =>
  client.post<CompareResult>('/compare', { tickers }).then(r => r.data)

export const getCompareHistory = () =>
  client.get<CompareResult[]>('/compare/history').then(r => r.data)