import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchStocks } from '../../api/stocks'
import type { Stock } from '../../types'

export default function Home() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await searchStocks(value)
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">

      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">
          Анализ акций MOEX
        </h1>
        <p className="text-gray-400 text-lg">
          Технический и фундаментальный анализ для начинающих инвесторов
        </p>
      </div>

      <div className="w-full max-w-2xl relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Найти акцию по тикеру или названию..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-lg"
        />

        {loading && (
          <div className="absolute right-4 top-4 text-gray-400">
            Загрузка...
          </div>
        )}

        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-10">
            {results.map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => navigate(`/stocks/${stock.ticker}`)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-700 transition-colors text-left"
              >
                <div>
                  <span className="text-blue-400 font-mono font-bold mr-3">
                    {stock.ticker}
                  </span>
                  <span className="text-white">{stock.name}</span>
                </div>
                <span className="text-gray-500 text-sm">{stock.sector}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 text-sm text-gray-500">
        <span>Например:</span>
        {['SBER', 'GAZP', 'LKOH', 'GMKN'].map(ticker => (
          <button
            key={ticker}
            onClick={() => navigate(`/stocks/${ticker}`)}
            className="text-blue-400 hover:text-blue-300 transition-colors font-mono"
          >
            {ticker}
          </button>
        ))}
      </div>

    </div>
  )
}