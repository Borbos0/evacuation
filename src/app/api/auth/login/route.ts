import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '@/server/db/client'
import { sessionOptions, type SessionData } from '@/server/auth/session'
import { checkCSRF } from '@/server/security/csrf'
import { rateLimiter, getClientIp } from '@/server/security/rate-limiter'

const schema = z.object({
  login: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
})

export async function POST(request: Request) {
  const csrf = checkCSRF(request)
  if (!csrf.ok) {
    return Response.json(
      { error: { code: 'CSRF_CHECK_FAILED', message: 'Запрос отклонён' } },
      { status: 403 }
    )
  }

  const ip = getClientIp(request)
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Неверный формат данных' } },
      { status: 400 }
    )
  }

  const { login, password } = parsed.data

  if (!rateLimiter.loginPerMinute(ip, login) || !rateLimiter.loginPerHour(ip, login)) {
    return Response.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Слишком много попыток. Попробуйте позже.' } },
      { status: 429 }
    )
  }

  const user = await prisma.user.findUnique({ where: { login } })
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false

  if (!user || !valid) {
    return Response.json(
      { error: { code: 'INVALID_CREDENTIALS', message: 'Неверный логин или пароль' } },
      { status: 401 }
    )
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  session.userId = user.id
  await session.save()

  return Response.json({
    success: true,
    user: {
      id: user.id,
      login: user.login,
      displayName: user.displayName ?? user.login,
    },
  })
}
