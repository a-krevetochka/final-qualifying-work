import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { compareStocks } from '../../api/compare'
import { useCompareStore } from '../../store/compareStore'
import type { CompareItem } from '../../types'

interface CompareResult {
  tickers: string[]
  items:   CompareItem[]
}

const METRICS = [
  { key: 'currentPrice',         label: 'Цена',              format: (v: number) => `${v?.toFixed(2)} ₽` },
  { key: 'grahamScore',          label: 'Оценка Грэма',      format: (v: number) => `${v?.toFixed(0)}/100` },
  { key: 'grahamInterpretation', label: 'Привлекательность', format: (v: string) => v },
  { key: 'peRatio',              label: 'P/E',                format: (v: number) => v?.toFixed(1) ?? '—' },
  { key: 'pbRatio',              label: 'P/B',                format: (v: number) => v?.toFixed(2) ?? '—' },
  { key: 'roe',                  label: 'ROE',                format: (v: number) => v ? `${v.toFixed(1)}%` : '—' },
  { key: 'divYield',             label: 'Дивиденды',          format: (v: number) => v ? `${v.toFixed(1)}%` : '—' },
  { key: 'debtToEquity',         label: 'Долг/Капитал',       format: (v: number) => v?.toFixed(1) ?? '—' },
  { key: 'signal3d',             label: 'ML сигнал 3д',       format: (v: string) => v ?? '—' },
  { key: 'signal5d',             label: 'ML сигнал 5д',       format: (v: string) => v ?? '—' },
  { key: 'signal10d',            label: 'ML сигнал 10д',      format: (v: string) => v ?? '—' },
  { key: 'signal30d',            label: 'ML сигнал 30д',      format: (v: string) => v ?? '—' },
]

function getValueColor(key: string, value: unknown): string {
  if (key === 'grahamInterpretation') {
    if (value === 'Привлекательна') return 'text-green-400'
    if (value === 'Нейтральна')     return 'text-yellow-400'
    return 'text-red-400'
  }
  if (['signal3d','signal5d','signal10d','signal30d'].includes(key) && typeof value === 'string') {
    return value.includes('вверх') ? 'text-green-400' : 'text-red-400'
  }
  return 'text-white'
}

export default function Compare() {
  const navigate                                          = useNavigate()
  const { tickers, activeTickers, add, remove, clear, swapActive } = useCompareStore()
  const [input, setInput]                                = useState('')
  const [result, setResult]                              = useState<CompareResult | null>(null)
  const [loading, setLoading]                            = useState(false)
  const [error, setError]                                = useState('')
  const [swapTarget, setSwapTarget]                      = useState<string | null>(null)

  const handleAddTicker = () => {
    const t = input.trim().toUpperCase()
    if (!t) return
    if (tickers.includes(t)) {
      setError('Тикер уже добавлен')
      return
    }
    add(t)
    setInput('')
    setError('')
  }

  const handleCompare = async (tickersToCompare = activeTickers) => {
    if (tickersToCompare.length < 2) {
      setError('Добавьте минимум 2 тикера')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await compareStocks(tickersToCompare)
      setResult(data)
    } catch {
      setError('Ошибка сравнения. Проверьте тикеры.')
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = (oldTicker: string, newTicker: string) => {
    swapActive(oldTicker, newTicker)
    setSwapTarget(null)
    handleCompare(activeTickers.map(t => t === oldTicker ? newTicker : t))
  }

  useEffect(() => {
    if (activeTickers.length >= 2) {
      handleCompare(activeTickers)
    }
  }, [])

  const inactiveTickers = tickers.filter(t => !activeTickers.includes(t))

  return (
    <div className="flex flex-col gap-6">

      <h1 className="text-2xl font-bold text-white">Сравнение акций</h1>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">

        {/* Все добавленные тикеры */}
        <div className="mb-4">
          <div className="text-gray-400 text-xs mb-2">Добавленные акции</div>
          <div className="flex flex-wrap gap-2">
            {tickers.map(ticker => {
              const isActive = activeTickers.includes(ticker)
              return (
                <div
                  key={ticker}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors ${
                    isActive
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  <span className="font-mono font-bold text-sm">{ticker}</span>
                  {!isActive && (
                    <span className="text-gray-600 text-xs">неактивен</span>
                  )}
                  <button
                    onClick={() => remove(ticker)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>
              )
            })}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTicker()}
                placeholder="Тикер..."
                maxLength={6}
                className="w-24 bg-gray-800 border border-dashed border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddTicker}
                className="text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Активные тикеры для сравнения */}
        {tickers.length > 3 && (
          <div className="mb-4 p-4 bg-gray-800 rounded-xl">
            <div className="text-gray-400 text-xs mb-2">
              В таблице показываются 3 акции. Нажмите на тикер чтобы заменить его:
            </div>
            <div className="flex flex-wrap gap-2">
              {activeTickers.map(ticker => (
                <div key={ticker} className="relative">
                  <button
                    onClick={() => setSwapTarget(swapTarget === ticker ? null : ticker)}
                    className={`px-3 py-2 rounded-lg font-mono font-bold text-sm border transition-colors ${
                      swapTarget === ticker
                        ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                        : 'border-blue-500 text-blue-400 bg-blue-600/10'
                    }`}
                  >
                    {ticker} {swapTarget === ticker ? '↕' : ''}
                  </button>

                  {swapTarget === ticker && inactiveTickers.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden z-10 min-w-24">
                      {inactiveTickers.map(t => (
                        <button
                          key={t}
                          onClick={() => handleSwap(ticker, t)}
                          className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-800 font-mono text-sm transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCompare(activeTickers)}
            disabled={loading || activeTickers.length < 2}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Сравниваем...' : 'Сравнить'}
          </button>
          {tickers.length > 0 && (
            <button
              onClick={() => { clear(); setResult(null) }}
              className="text-gray-500 hover:text-red-400 text-sm transition-colors"
            >
              Очистить всё
            </button>
          )}
        </div>
      </div>

      {result && result.items.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs font-medium px-6 py-4 w-44">
                  Показатель
                </th>
                {result.items.map(item => (
                  <th key={item.ticker} className="text-center px-6 py-4">
                    <button
                      onClick={() => navigate(`/stocks/${item.ticker}`)}
                      className="text-blue-400 font-mono font-bold text-lg hover:text-blue-300 transition-colors"
                    >
                      {item.ticker}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric, i) => (
                <tr
                  key={metric.key}
                  className={`border-b border-gray-800 last:border-0 ${
                    i % 2 === 0 ? '' : 'bg-gray-800/30'
                  }`}
                >
                  <td className="px-6 py-3 text-gray-400 text-sm">{metric.label}</td>
                  {result.items.map(item => {
                    const value = item[metric.key as keyof CompareItem]
                    const color = getValueColor(metric.key, value)
                    return (
                      <td key={item.ticker} className={`px-6 py-3 text-center text-sm font-medium ${color}`}>
                        {value != null ? metric.format(value as never) : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}