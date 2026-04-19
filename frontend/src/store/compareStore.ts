import { create } from 'zustand'

interface CompareStore {
  tickers:       string[]
  activeTickers: string[]
  add:           (ticker: string) => void
  remove:        (ticker: string) => void
  clear:         () => void
  has:           (ticker: string) => boolean
  swapActive:    (oldTicker: string, newTicker: string) => void
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  tickers:       [],
  activeTickers: [],

  add: (ticker) => {
    if (get().tickers.includes(ticker)) return
    const tickers       = [...get().tickers, ticker]
    const activeTickers = get().activeTickers.length < 3
      ? [...get().activeTickers, ticker]
      : get().activeTickers

    set({ tickers, activeTickers })
  },

  remove: (ticker) => {
    const tickers = get().tickers.filter(t => t !== ticker)
    let active    = get().activeTickers.filter(t => t !== ticker)

    if (active.length < 3) {
      const inactive = tickers.find(t => !active.includes(t))
      if (inactive) active = [...active, inactive]
    }

    set({ tickers, activeTickers: active })
  },

  clear: () => set({ tickers: [], activeTickers: [] }),

  has: (ticker) => get().tickers.includes(ticker),

  swapActive: (oldTicker, newTicker) => {
    const active = get().activeTickers.map(t => t === oldTicker ? newTicker : t)
    set({ activeTickers: active })
  },
}))