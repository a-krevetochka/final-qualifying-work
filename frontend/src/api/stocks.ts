import client from './client'
import type { Stock, StockPrice, ChartCandle, Analysis } from '../types'

export const searchStocks = (q: string) =>
  client.get<Stock[]>(`/stocks/search?q=${q}`).then(r => r.data)

export const getStock = (ticker: string) =>
  client.get<Stock>(`/stocks/${ticker}`).then(r => r.data)

export const getStockPrice = (ticker: string) =>
  client.get<StockPrice>(`/stocks/${ticker}/price`).then(r => r.data)

export const getChart = (ticker: string, period: string) =>
  client.get<ChartCandle[]>(`/stocks/${ticker}/chart?period=${period}`).then(r => r.data)

export const getAnalysis = (ticker: string) =>
  client.get<Analysis>(`/stocks/${ticker}/analysis`).then(r => r.data)