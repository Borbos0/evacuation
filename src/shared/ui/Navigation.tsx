'use client'
import Link from 'next/link'
import { useAuth } from '@/features/auth/AuthProvider'

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg hover:text-blue-100">
            Evacuation
          </Link>
          {isAuthenticated && (
            <Link href="/profile" className="text-sm hover:text-blue-100">
              Профиль
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/admin/vehicles" className="text-sm hover:text-blue-100">
              Управление ТС
            </Link>
          )}
        </div>
        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-100">{user.displayName ?? user.login}</span>
            <button
              onClick={logout}
              className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
            >
              Выйти
            </button>
          </div>
        ) : (
          <Link href="/login" className="text-sm hover:text-blue-100">
            Войти
          </Link>
        )}
      </div>
    </nav>
  )
}
