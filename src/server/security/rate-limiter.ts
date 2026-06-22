import 'server-only'
import { env } from '@/server/config/env'

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

function check(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export const rateLimiter = {
  loginPerMinute: (ip: string, login: string) =>
    check(`lm:${ip}:${login}`, env.RATE_LIMIT_LOGIN_PER_MINUTE, 60_000),
  loginPerHour: (ip: string, login: string) =>
    check(`lh:${ip}:${login}`, env.RATE_LIMIT_LOGIN_PER_HOUR, 3_600_000),
  searchPerMinute: (ip: string) =>
    check(`sm:${ip}`, env.RATE_LIMIT_SEARCH_PER_MINUTE, 60_000),
}

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
