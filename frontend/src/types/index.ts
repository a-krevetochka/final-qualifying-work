export interface Stock {
  ticker: string
  name: string
  sector: string
  price: number
  priceChange: number
  marketCap: number
}

export interface StockPrice {
  ticker: string
  price: number
  change: number
  changePct: number
  volume: number
  updatedAt: string
}

export interface ChartCandle {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export interface Signal {
  signal: number
  direction: string
  confidence: number
}

export interface Analysis {
  ticker: string
  currentPrice: number
  lastDate: string
  signal3d: string
  signal5d: string
  signal10d: string
  signal30d: string
  grahamScore: number
  grahamInterpretation: string
  consensusRecommendation: string
  targetPrice: number
  peRatio: number
  pbRatio: number
  roe: number
  roa: number
  netMargin: number
  debtToEquity: number
  divYield: number
}

export interface ScreenerResult {
  ticker:         string
  name:           string | null
  currentPrice:   number | null
  grahamScore:    number | null
  interpretation: string | null
  signal10d:      string | null
  peRatio:        number | null
  divYield:       number | null
  source?:        string
}

export interface CompareItem {
  ticker:               string
  currentPrice:         number | null
  signal3d:             string | null
  signal5d:             string | null
  signal10d:            string | null
  signal30d:            string | null
  grahamScore:          number | null
  grahamInterpretation: string | null
  peRatio:              number | null
  pbRatio:              number | null
  roe:                  number | null
  divYield:             number | null
  debtToEquity:         number | null
}

export interface GlossaryTerm {
  id: number
  term: string
  definition: string
  example: string
  category: string
}

export interface User {
  id: number
  email: string
  username: string
  createdAt: string
}

export interface Favorite {
  ticker: string
  companyName: string
  addedAt: string
}

export interface AuthResponse {
  token: string
  email: string
  username: string
}