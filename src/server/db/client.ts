import 'server-only'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import { env } from '@/server/config/env'

function createPrismaClient() {
  const filePath = env.DATABASE_URL.replace('file:', '')
  const absPath = path.resolve(process.cwd(), filePath)
  const adapter = new PrismaBetterSqlite3({ url: absPath })
  return new PrismaClient({ adapter } as never)
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
