import 'server-only'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from './session'
import { prisma } from '@/server/db/client'

export const USER_SELECT = {
  id: true,
  login: true,
  displayName: true,
  phone: true,
  email: true,
  isAdmin: true,
  vehicleId: true,
} as const

export async function getCurrentUser() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.userId) return null
  return prisma.user.findUnique({ where: { id: session.userId }, select: USER_SELECT })
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) return null
  return user
}
