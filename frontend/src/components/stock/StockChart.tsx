import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { ChartCandle } from '../../types'

interface Props {
  candles: ChartCandle[]
}

export default function StockChart({ candles }: Props) {
  if (candles.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Нет данных для графика
      </div>
    )
  }

  const data = candles.map(c => ({
    date:  c.date.slice(0, 10),
    close: c.close,
    open:  c.open,
    high:  c.high,
    low:   c.low,
  }))

  const minPrice = Math.min(...data.map(d => d.close)) * 0.99
  const maxPrice = Math.max(...data.map(d => d.close)) * 1.01
  const isGrowing = data[data.length - 1].close >= data[0].close

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
        <defs>
          <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={isGrowing ? '#22c55e' : '#ef4444'}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={isGrowing ? '#22c55e' : '#ef4444'}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.toFixed(0)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#fff',
          }}
          formatter={(value: number) => [`${value.toFixed(2)} ₽`, 'Цена']}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke={isGrowing ? '#22c55e' : '#ef4444'}
          strokeWidth={2}
          fill="url(#colorClose)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}