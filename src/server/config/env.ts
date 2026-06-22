import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  SESSION_TTL_SECONDS: z.coerce.number().positive().default(604800),
  ADMIN_SECRET: z.string().min(1),
  APP_URL: z.string().url(),
  RATE_LIMIT_LOGIN_PER_MINUTE: z.coerce.number().positive().default(5),
  RATE_LIMIT_LOGIN_PER_HOUR: z.coerce.number().positive().default(20),
  RATE_LIMIT_SEARCH_PER_MINUTE: z.coerce.number().positive().default(30),
})

export const env = (() => {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Ошибка конфигурации env:', result.error.flatten())
    process.exit(1)
  }
  return result.data
})()
