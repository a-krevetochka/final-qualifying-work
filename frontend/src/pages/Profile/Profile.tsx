import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, updateProfile, updatePassword } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

export default function Profile() {
  const { isAuth, logout, setAuth } = useAuthStore()
  const navigate                    = useNavigate()
  const [username, setUsername]     = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [email, setEmail]           = useState('')

  useEffect(() => {
    if (!isAuth()) {
      navigate('/login')
      return
    }
    getMe().then(data => {
      setEmail(data.email)
      setUsername(data.username)
      setAuth(data)
    })
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg('')
    setProfileError('')
    try {
      await updateProfile(username)
      setProfileMsg('Имя успешно обновлено')
    } catch {
      setProfileError('Ошибка обновления профиля')
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg('')
    setPasswordError('')
    try {
      await updatePassword(oldPassword, newPassword)
      setPasswordMsg('Пароль успешно изменён')
      setOldPassword('')
      setNewPassword('')
    } catch {
      setPasswordError('Неверный текущий пароль')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div className="text-white font-semibold text-lg">{username}</div>
              <div className="text-gray-500 text-sm">{email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 hover:border-red-400 px-4 py-2 rounded-lg transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Изменить имя</h2>
        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            required
          />
          {profileMsg && (
            <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2 rounded-lg">
              {profileMsg}
            </div>
          )}
          {profileError && (
            <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
              {profileError}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Сохранить
          </button>
        </form>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Изменить пароль</h2>
        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Текущий пароль</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              required
              minLength={6}
            />
          </div>
          {passwordMsg && (
            <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2 rounded-lg">
              {passwordMsg}
            </div>
          )}
          {passwordError && (
            <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
              {passwordError}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Изменить пароль
          </button>
        </form>
      </div>

    </div>
  )
}