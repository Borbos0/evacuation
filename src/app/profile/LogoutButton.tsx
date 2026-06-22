'use client'
import { useAuth } from '@/features/auth/AuthProvider'

export function LogoutButton() {
  const { logout } = useAuth()
  return (
    <button
      onClick={logout}
      className="text-sm text-red-600 hover:text-red-700 font-medium"
    >
      Выйти из аккаунта
    </button>
  )
}
