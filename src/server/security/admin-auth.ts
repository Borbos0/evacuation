import 'server-only'
import { env } from '@/server/config/env'

export function checkAdminAuth(request: Request): boolean {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return false
  return header.slice(7) === env.ADMIN_SECRET
}
