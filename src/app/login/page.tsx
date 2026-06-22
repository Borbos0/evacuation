'use client'
import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/auth/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setIsLoading(true)

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          if (res.status === 429) {
            setError('Слишком много попыток входа. Попробуйте позже.')
          } else {
            setError(data.error?.message ?? 'Неверный логин или пароль')
          }
          return
        }

        await refreshUser()
        const next = searchParams.get('next') ?? '/profile'
        router.push(next)
      } catch {
        setError('Ошибка соединения. Попробуйте ещё раз.')
      } finally {
        setIsLoading(false)
      }
    },
    [login, password, refreshUser, router, searchParams]
  )

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">Вход в систему</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 shadow-xl rounded-lg p-6 space-y-4 border border-gray-700">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-200 mb-1">
              Логин
            </label>
            <input
              id="login"
              type="text"
              autoComplete="username"
              value={login}
              onChange={e => setLogin(e.target.value)}
              required
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
              Пароль
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs"
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-700 rounded px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </main>
  )
}
