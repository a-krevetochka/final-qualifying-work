import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCompareStore } from '../../store/compareStore'

export default function Layout() {
  const { isAuth, logout, user }            = useAuthStore()
  const { tickers: compareTickers }         = useCompareStore()
  const navigate                            = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-blue-400">
              StockAnalyzer
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/screener" className="hover:text-white transition-colors">
                Скринер
              </Link>
              <Link to="/compare" className="hover:text-white transition-colors">
                Сравнение
              </Link>
              <Link to="/glossary" className="hover:text-white transition-colors">
                Словарь
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {isAuth() ? (
              <>
                <Link to="/favorites" className="text-gray-400 hover:text-white transition-colors">
                  Избранное
                </Link>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
                  {user?.username ?? 'Профиль'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-800 mt-16 py-8 text-center text-gray-600 text-sm">
        StockAnalyzer — инструмент для анализа акций MOEX. Не является инвестиционной рекомендацией.
      </footer>

      {compareTickers.length >= 2 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => navigate('/compare')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            Сравнить {compareTickers.length} акции →
          </button>
        </div>
      )}
    </div>
  )
}