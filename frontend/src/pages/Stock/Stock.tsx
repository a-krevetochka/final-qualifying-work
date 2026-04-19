import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getStock, getStockPrice, getChart, getAnalysis } from '../../api/stocks'
import { addFavorite, removeFavorite, getFavorites } from '../../api/favorites'
import { useAuthStore } from '../../store/authStore'
import { useCompareStore } from '../../store/compareStore'
import type { Stock as StockType, StockPrice, ChartCandle, Analysis } from '../../types'
import StockChart from '../../components/stock/StockChart'
import AnalysisCard from '../../components/stock/AnalysisCard'
import FundamentalCard from '../../components/stock/FundamentalCard'

const PERIODS = ['1M', '3M', '6M', '1Y']

export default function Stock() {
  const { ticker }                            = useParams<{ ticker: string }>()
  const { isAuth }                            = useAuthStore()
  const { add, remove, has, tickers: compareTickers } = useCompareStore()
  const [stock, setStock]                     = useState<StockType | null>(null)
  const [price, setPrice]                     = useState<StockPrice | null>(null)
  const [candles, setCandles]                 = useState<ChartCandle[]>([])
  const [analysis, setAnalysis]               = useState<Analysis | null>(null)
  const [period, setPeriod]                   = useState('3M')
  const [isFavorite, setIsFavorite]           = useState(false)
  const [loading, setLoading]                 = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(true)

  const inCompare = has(ticker ?? '')

  const loadData = useCallback(async () => {
    if (!ticker) return
    setLoading(true)
    try {
      const [stockData, priceData, chartData] = await Promise.all([
        getStock(ticker),
        getStockPrice(ticker),
        getChart(ticker, period),
      ])
      setStock(stockData)
      setPrice(priceData)
      setCandles(chartData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [ticker, period])

  const loadAnalysis = useCallback(async () => {
    if (!ticker) return
    setAnalysisLoading(true)
    try {
      const data = await getAnalysis(ticker)
      setAnalysis(data)
    } catch (e) {
      console.error(e)
    } finally {
      setAnalysisLoading(false)
    }
  }, [ticker])

  const checkFavorite = useCallback(async () => {
    if (!isAuth()) return
    try {
      const favs = await getFavorites()
      setIsFavorite(favs.some(f => f.ticker === ticker))
    } catch {}
  }, [ticker, isAuth])

  useEffect(() => {
    loadData()
    loadAnalysis()
    checkFavorite()
  }, [loadData, loadAnalysis, checkFavorite])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!ticker) return
      try {
        const priceData = await getStockPrice(ticker)
        setPrice(priceData)
      } catch {}
    }, 30000)
    return () => clearInterval(interval)
  }, [ticker])

  const toggleFavorite = async () => {
    if (!ticker) return
    try {
      if (isFavorite) {
        await removeFavorite(ticker)
        setIsFavorite(false)
      } else {
        await addFavorite(ticker)
        setIsFavorite(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const toggleCompare = () => {
    if (!ticker) return
    inCompare ? remove(ticker) : add(ticker)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-400">Акция не найдена</div>
      </div>
    )
  }

  const changeColor = price && price.change >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white">{ticker}</h1>
            <span className="text-gray-400 text-lg">{stock.name}</span>
          </div>
          <span className="text-gray-500 text-sm">{stock.sector}</span>
        </div>

        <div className="flex items-center gap-3">
          {price && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {price.price?.toFixed(2)} ₽
              </div>
              <div className={`text-sm ${changeColor}`}>
                {price.change >= 0 ? '+' : ''}{price.change?.toFixed(2)} (
                {price.changePct?.toFixed(2)}%)
              </div>
            </div>
          )}

          <button
  onClick={toggleCompare}
  className={`px-4 py-2 rounded-lg border transition-colors text-sm ${
    inCompare
      ? 'border-purple-500 text-purple-400 hover:bg-purple-500/10'
      : 'border-gray-600 text-gray-400 hover:border-purple-500 hover:text-purple-400'
  }`}
>
  {inCompare ? 'В сравнении' : 'Сравнить'}
</button>

          {isAuth() && (
            <button
              onClick={toggleFavorite}
              className={`px-4 py-2 rounded-lg border transition-colors text-sm ${
                isFavorite
                  ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10'
                  : 'border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400'
              }`}
            >
              {isFavorite ? 'В избранном' : 'В избранное'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-4">
        <div className="flex gap-2 mb-4">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <StockChart candles={candles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalysisCard analysis={analysis} loading={analysisLoading} />
        <FundamentalCard analysis={analysis} loading={analysisLoading} />
      </div>

      <div className="text-xs text-gray-600 text-center">
        Данные предоставляются с задержкой ~15 минут. Не является инвестиционной рекомендацией.
      </div>

    </div>
  )
}