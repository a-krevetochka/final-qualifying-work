import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getFavorites, removeFavorite } from '../../api/favorites'
import { useAuthStore } from '../../store/authStore'
import type { Favorite } from '../../types'

export default function Favorites() {
  const { isAuth }                    = useAuthStore()
  const navigate                      = useNavigate()
  const [favorites, setFavorites]     = useState<Favorite[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!isAuth()) {
      navigate('/login')
      return
    }
    getFavorites()
      .then(setFavorites)
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (ticker: string) => {
    try {
      await removeFavorite(ticker)
      setFavorites(prev => prev.filter(f => f.ticker !== ticker))
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Избранное</h1>
        <span className="text-gray-500 text-sm">{favorites.length} акций</span>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 text-center border border-gray-800">
          <div className="text-4xl mb-4">⭐</div>
          <div className="text-gray-400 mb-4">Список избранного пуст</div>
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Найти акции
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {favorites.map(fav => (
            <div
              key={fav.ticker}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between"
            >
              <Link
                to={`/stocks/${fav.ticker}`}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 font-mono font-bold text-sm">
                    {fav.ticker.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{fav.ticker}</div>
                  <div className="text-gray-500 text-sm">{fav.companyName}</div>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-xs">
                  {new Date(fav.addedAt).toLocaleDateString('ru-RU')}
                </span>
                <button
                  onClick={() => handleRemove(fav.ticker)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}