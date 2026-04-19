import type { Analysis } from '../../types'

interface Props {
  analysis: Analysis | null
  loading:  boolean
}

interface MetricRowProps {
  label:      string
  value:      number | null
  format?:    (v: number) => string
  good?:      (v: number) => boolean
  tooltip?:   string
}

function MetricRow({ label, value, format, good, tooltip }: MetricRowProps) {
  const formatted = value != null ? (format ? format(value) : value.toFixed(2)) : '—'
  const color     = value != null && good ? (good(value) ? 'text-green-400' : 'text-red-400') : 'text-white'

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-1">
        <span className="text-gray-400 text-sm">{label}</span>
        {tooltip && (
          <span className="text-gray-600 text-xs cursor-help" title={tooltip}>?</span>
        )}
      </div>
      <span className={`text-sm font-medium ${color}`}>{formatted}</span>
    </div>
  )
}

function GrahamScore({ score, interpretation }: { score: number, interpretation: string }) {
  const color = score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
  const bg    = score >= 70 ? 'bg-green-500'   : score >= 50 ? 'bg-yellow-500'   : 'bg-red-500'

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">Скоринг Грэма</span>
        <span className={`font-bold text-lg ${color}`}>{score}/100</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${bg}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className={`text-sm ${color}`}>{interpretation}</div>
    </div>
  )
}

export default function FundamentalCard({ analysis, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Фундаментальный анализ</h2>
        <div className="text-gray-500">Загружаем данные...</div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Фундаментальный анализ</h2>
        <div className="text-gray-500">Нет данных</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Фундаментальный анализ</h2>

      {analysis.grahamScore != null && (
        <GrahamScore
          score={analysis.grahamScore}
          interpretation={analysis.grahamInterpretation}
        />
      )}

      <div className="flex flex-col">
        <MetricRow
          label="P/E"
          value={analysis.peRatio}
          good={(v) => v > 0 && v < 15}
          tooltip="Цена / Прибыль. Норма для РФ: 5-15"
        />
        <MetricRow
          label="P/B"
          value={analysis.pbRatio}
          good={(v) => v > 0 && v < 1.5}
          tooltip="Цена / Балансовая стоимость. Норма: < 1.5"
        />
        <MetricRow
          label="ROE"
          value={analysis.roe}
          format={(v) => `${v.toFixed(1)}%`}
          good={(v) => v > 10}
          tooltip="Рентабельность капитала. Норма: > 10%"
        />
        <MetricRow
          label="ROA"
          value={analysis.roa}
          format={(v) => `${v.toFixed(1)}%`}
          good={(v) => v > 0}
          tooltip="Рентабельность активов. Норма: > 0%"
        />
        <MetricRow
          label="Чистая маржа"
          value={analysis.netMargin}
          format={(v) => `${v.toFixed(1)}%`}
          good={(v) => v > 5}
          tooltip="Чистая прибыль / Выручка. Норма: > 5%"
        />
        <MetricRow
          label="Долг/Капитал"
          value={analysis.debtToEquity}
          good={(v) => v < 100}
          tooltip="Долговая нагрузка. Норма: < 100%"
        />
        <MetricRow
          label="Дивиденды"
          value={analysis.divYield}
          format={(v) => `${v.toFixed(1)}%`}
          good={(v) => v > 0}
          tooltip="Дивидендная доходность"
        />
      </div>
    </div>
  )
}