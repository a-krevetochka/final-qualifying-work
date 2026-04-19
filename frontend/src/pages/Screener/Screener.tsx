import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { screenStocks } from '../../api/screener'
import { getStockPrice } from '../../api/stocks'
import type { ScreenerResult } from '../../types'

const SECTORS = [
  { value: '',            label: 'Все секторы' },
  { value: 'financial',   label: 'Финансы' },
  { value: 'energy',      label: 'Нефть и газ' },
  { value: 'materials',   label: 'Металлы и добыча' },
  { value: 'telecom',     label: 'Телекомы' },
  { value: 'consumer',    label: 'Потребительский' },
  { value: 'utilities',   label: 'Энергетика' },
  { value: 'industrials', label: 'Промышленность' },
  { value: 'it',          label: 'IT' },
  { value: 'health_care', label: 'Здравоохранение' },
  { value: 'real_estate', label: 'Недвижимость' },
  { value: 'other',       label: 'Прочее' },
]

const SORTS = [
  { value: '',             label: 'По умолчанию' },
  { value: 'div_yield',    label: 'По дивидендам' },
  { value: 'graham_score', label: 'По оценке Грэма' },
]

const PAGE_SIZE = 20

export default function Screener() {
  const navigate                = useNavigate()
  const [results, setResults]   = useState<ScreenerResult[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [sector, setSector]     = useState('')
  const [peMax, setPeMax]       = useState('')
  const [divMin, setDivMin]     = useState('')
  const [sort, setSort]         = useState('')
  const [priceMap, setPriceMap] = useState<Record<string, number>>({})

  const refreshPrices = async (currentResults: ScreenerResult[]) => {
    const updates: Record<string, number> = {}
    await Promise.allSettled(
      currentResults.map(async r => {
        try {
          const price = await getStockPrice(r.ticker)
          if (price?.price) updates[r.ticker] = price.price
        } catch {}
      })
    )
    setPriceMap(prev => ({ ...prev, ...updates }))
  }

  useEffect(() => {
    if (results.length === 0) return
    refreshPrices(results)
    const interval = setInterval(() => refreshPrices(results), 30000)
    return () => clearInterval(interval)
  }, [results])

  const handleScreen = async (p = 0) => {
    setLoading(true)
    try {
      const data = await screenStocks({
        sector: sector || undefined,
        peMax:  peMax  ? parseFloat(peMax)  : undefined,
        divMin: divMin ? parseFloat(divMin) : undefined,
        sort:   sort   || undefined,
        page:   p,
        size:   PAGE_SIZE,
      })
      setResults(Array.isArray(data) ? data : (data?.results ?? []))
      setTotal(typeof data === 'object' && 'total' in data ? data.total : 0)
      setPage(p)
    } catch (e) {
      console.error(e)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    setPage(0)
    handleScreen(0)
  }

  const handleReset = () => {
    setSector('')
    setPeMax('')
    setDivMin('')
    setSort('')
    setPage(0)
    handleScreen(0)
  }

  useEffect(() => {
    handleScreen(0)
  }, [])

  const interpretationColor = (v: string | null) => {
    if (v === 'Привлекательна') return 'text-green-400'
    if (v === 'Нейтральна')     return 'text-yellow-400'
    return 'text-red-400'
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Скринер акций</h1>
        <span className="text-gray-500 text-sm">
          {total > 0 ? `${total} результатов` : ''}
        </span>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Сектор</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {SECTORS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">P/E максимум</label>
            <input
              type="number"
              value={peMax}
              onChange={(e) => setPeMax(e.target.value)}
              placeholder="Например: 15"
              min="0"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Дивиденды минимум %</label>
            <input
              type="number"
              value={divMin}
              onChange={(e) => setDivMin(e.target.value)}
              placeholder="Например: 5"
              min="0"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Сортировка</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {SORTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFilter}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Поиск...' : 'Найти'}
          </button>
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm border border-gray-700 hover:border-gray-500 transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Загрузка...</div>
      ) : results.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Ничего не найдено. Измените фильтры.
        </div>
      ) : (
        <>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 text-xs font-medium px-6 py-3">Тикер</th>
                  <th className="text-left text-gray-500 text-xs font-medium px-6 py-3">Название</th>
                  <th className="text-right text-gray-500 text-xs font-medium px-6 py-3">Цена</th>
                  <th className="text-right text-gray-500 text-xs font-medium px-6 py-3">P/E</th>
                  <th className="text-right text-gray-500 text-xs font-medium px-6 py-3">Дивиденды</th>
                  <th className="text-right text-gray-500 text-xs font-medium px-6 py-3">Оценка Грэма</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={r.ticker}
                    onClick={() => navigate(`/stocks/${r.ticker}`)}
                    className={`border-b border-gray-800 last:border-0 transition-colors cursor-pointer hover:bg-gray-800 ${
                      i % 2 === 0 ? '' : 'bg-gray-900/50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-blue-400 font-mono font-bold">{r.ticker}</span>
                      {!r.grahamScore && (
                        <span className="text-gray-600 text-xs ml-2">нет данных</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {r.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {priceMap[r.ticker]
                        ? `${priceMap[r.ticker].toFixed(2)} ₽`
                        : r.currentPrice
                        ? `${r.currentPrice.toFixed(2)} ₽`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {r.peRatio && r.peRatio > 0 ? r.peRatio.toFixed(1) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {r.divYield && r.divYield > 0 ? `${r.divYield.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.grahamScore ? (
                        <span className={interpretationColor(r.interpretation)}>
                          {r.grahamScore?.toFixed(0)} — {r.interpretation}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleScreen(page - 1)}
                disabled={page === 0 || loading}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors text-sm"
              >
                Назад
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page < 3 ? i : page - 2 + i
                  if (p >= totalPages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => handleScreen(p)}
                      className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                        p === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {p + 1}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handleScreen(page + 1)}
                disabled={page + 1 >= totalPages || loading}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors text-sm"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}

    </div>
  )
}