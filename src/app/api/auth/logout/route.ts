import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions } from '@/server/auth/session'
import { checkCSRF } from '@/server/security/csrf'

export async function POST(request: Request) {
  const csrf = checkCSRF(request)
  if (!csrf.ok) {
    return Response.json(
      { error: { code: 'CSRF_CHECK_FAILED', message: 'Запрос отклонён' } },
      { status: 403 }
    )
  }
  const session = await getIronSession(await cookies(), sessionOptions)
  session.destroy()
  return Response.json({ success: true })
}
