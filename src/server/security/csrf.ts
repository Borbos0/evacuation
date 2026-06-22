import 'server-only'
import { env } from '@/server/config/env'

export function checkCSRF(request: Request): { ok: boolean; error?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true }
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const check = origin ?? referer
  if (!check || !check.startsWith(env.APP_URL)) {
    return { ok: false, error: 'CSRF check failed' }
  }
  return { ok: true }
}
