import type { Analysis } from '../../types'

interface Props {
  analysis: Analysis | null
  loading:  boolean
}

const SIGNAL_LABELS: Record<string, string> = {
  '3d':  '3 дня',
  '5d':  '5 дней',
  '10d': '10 дней',
  '30d': '30 дней',
}

function SignalBadge({ signal }: { signal: string | null }) {
  if (!signal) return <span className="text-gray-500">—</span>

  const isUp = signal.includes('вверх')
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
      isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
    }`}>
      {isUp ? '▲' : '▼'} {signal}
    </span>
  )
}

export default function AnalysisCard({ analysis, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">ML Сигналы</h2>
        <div className="text-gray-500">Анализируем данные...</div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">ML Сигналы</h2>
        <div className="text-gray-500">Нет данных</div>
      </div>
    )
  }

  const signals = {
    '3d':  analysis.signal3d,
    '5d':  analysis.signal5d,
    '10d': analysis.signal10d,
    '30d': analysis.signal30d,
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-white">ML Сигналы</h2>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(signals).map(([key, signal]) => (
          <div key={key} className="bg-gray-800 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-2">{SIGNAL_LABELS[key]}</div>
            <SignalBadge signal={signal} />
          </div>
        ))}
      </div>

      {analysis.consensusRecommendation && (
        <div className="border-t border-gray-800 pt-4">
          <div className="text-gray-400 text-sm mb-2">Мнение аналитиков</div>
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${
              analysis.consensusRecommendation === 'BUY'  ? 'text-green-400' :
              analysis.consensusRecommendation === 'SELL' ? 'text-red-400'   :
              'text-yellow-400'
            }`}>
              {analysis.consensusRecommendation === 'BUY'  ? 'ПОКУПАТЬ' :
               analysis.consensusRecommendation === 'SELL' ? 'ПРОДАВАТЬ' :
               'ДЕРЖАТЬ'}
            </span>
            {analysis.targetPrice && (
              <span className="text-gray-400 text-sm">
                Цель: {analysis.targetPrice.toFixed(2)} ₽
              </span>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600">
        ML прогноз не является инвестиционной рекомендацией
      </div>
    </div>
  )
}