import 'server-only'
import type { SessionOptions } from 'iron-session'
import { env } from '@/server/config/env'

export interface SessionData {
  userId?: string
}

export const sessionOptions: SessionOptions = {
  password: env.SESSION_SECRET,
  cookieName: 'evacuation_session',
  ttl: env.SESSION_TTL_SECONDS,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
}
