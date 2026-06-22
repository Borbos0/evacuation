import { getCurrentUser } from '@/server/auth/current-user'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ user: null })
  return Response.json({
    user: {
      id: user.id,
      login: user.login,
      displayName: user.displayName ?? user.login,
      phone: user.phone,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  })
}
