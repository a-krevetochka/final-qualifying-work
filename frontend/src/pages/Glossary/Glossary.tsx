import { useState, useEffect } from 'react'
import { getGlossary } from '../../api/glossary'
import type { GlossaryTerm } from '../../types'

const CATEGORIES = [
  { value: '',            label: 'Все' },
  { value: 'basics',      label: 'Основы' },
  { value: 'fundamental', label: 'Фундаментальный анализ' },
  { value: 'technical',   label: 'Технический анализ' },
  { value: 'ml',          label: 'ML и прогнозы' },
  { value: 'risk',        label: 'Риски' },
]

export default function Glossary() {
  const [terms, setTerms]         = useState<GlossaryTerm[]>([])
  const [loading, setLoading]     = useState(true)
  const [category, setCategory]   = useState('')
  const [query, setQuery]         = useState('')
  const [expanded, setExpanded]   = useState<number | null>(null)

  const loadTerms = async () => {
    setLoading(true)
    try {
      const data = await getGlossary(category || undefined, query || undefined)
      setTerms(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTerms()
  }, [category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadTerms()
  }

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id)
  }

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'basics':      return 'bg-blue-500/10 text-blue-400'
      case 'fundamental': return 'bg-green-500/10 text-green-400'
      case 'technical':   return 'bg-purple-500/10 text-purple-400'
      case 'ml':          return 'bg-orange-500/10 text-orange-400'
      case 'risk':        return 'bg-red-500/10 text-red-400'
      default:            return 'bg-gray-500/10 text-gray-400'
    }
  }

  const categoryLabel = (cat: string) => {
    return CATEGORIES.find(c => c.value === cat)?.label ?? cat
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Словарь инвестора</h1>
        <span className="text-gray-500 text-sm">{terms.length} терминов</span>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex flex-col gap-4">

        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск термина..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Найти
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                category === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Загрузка...</div>
      ) : terms.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Термины не найдены
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {terms.map(term => (
            <div
              key={term.id}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(term.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{term.term}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor(term.category)}`}>
                    {categoryLabel(term.category)}
                  </span>
                </div>
                <span className="text-gray-600 text-sm">
                  {expanded === term.id ? '▲' : '▼'}
                </span>
              </button>

              {expanded === term.id && (
                <div className="px-6 pb-4 border-t border-gray-800">
                  <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                    {term.definition}
                  </p>
                  {term.example && (
                    <div className="mt-3 bg-gray-800 rounded-lg px-4 py-3">
                      <div className="text-gray-500 text-xs mb-1">Пример</div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {term.example}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}