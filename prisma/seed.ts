import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcrypt'
import path from 'path'
import { normalizePlate } from '../src/shared/lib/normalize-plate'

const dbUrl = (process.env.DATABASE_URL ?? 'file:./dev.db').replace('file:', '')
const absPath = path.resolve(process.cwd(), dbUrl)
const adapter = new PrismaBetterSqlite3({ url: absPath })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  // Пользователи

  await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      passwordHash: await bcrypt.hash('admin', 12),
      displayName: 'Администратор',
      isAdmin: true,
    },
  })

  const demo = await prisma.user.upsert({
    where: { login: 'demo' },
    update: {},
    create: {
      login: 'demo',
      passwordHash: await bcrypt.hash('demo1234', 12),
      displayName: 'Иван Петров',
      phone: '+79990000001',
      email: 'ivan@example.com',
    },
  })

  const alex = await prisma.user.upsert({
    where: { login: 'alex' },
    update: {},
    create: {
      login: 'alex',
      passwordHash: await bcrypt.hash('alex1234', 12),
      displayName: 'Александр Смирнов',
      phone: '+79990000002',
    },
  })

  const kate = await prisma.user.upsert({
    where: { login: 'kate' },
    update: {},
    create: {
      login: 'kate',
      passwordHash: await bcrypt.hash('kate1234', 12),
      displayName: 'Екатерина Волкова',
      email: 'kate@example.com',
    },
  })

  // Транспортные средства

  // impounded - на штрафстоянке
  const v1 = await prisma.vehicle.upsert({
    where: { normalizedPlate: normalizePlate('А123ВС77') },
    update: {},
    create: {
      plate: 'А123ВС77',
      normalizedPlate: normalizePlate('А123ВС77'),
      brand: 'Toyota',
      model: 'Camry',
      storageAddress: 'г. Москва, ул. Складочная, 1с3',
      storagePhone: '+74951234567',
      storageLat: 55.7922,
      storageLng: 37.5856,
      status: 'impounded',
      evacuatedAt: new Date('2026-06-18T08:30:00Z'),
      isPublic: true,
    },
  })

  // released - уже выдано
  const v2 = await prisma.vehicle.upsert({
    where: { normalizedPlate: normalizePlate('В456ЕК99') },
    update: {},
    create: {
      plate: 'В456ЕК99',
      normalizedPlate: normalizePlate('В456ЕК99'),
      brand: 'BMW',
      model: 'X5',
      storageAddress: 'г. Москва, Варшавское ш., 170с1',
      storagePhone: '+74959876543',
      status: 'released',
      evacuatedAt: new Date('2026-06-15T14:00:00Z'),
      isPublic: true,
    },
  })

  // impounded - без марки/модели (номер только)
  const v3 = await prisma.vehicle.upsert({
    where: { normalizedPlate: normalizePlate('О777РР777') },
    update: {},
    create: {
      plate: 'О777РР777',
      normalizedPlate: normalizePlate('О777РР777'),
      storageAddress: 'г. Москва, ул. Иловайская, 2',
      storagePhone: '+74953334455',
      storageLat: 55.7031,
      storageLng: 37.7589,
      status: 'impounded',
      evacuatedAt: new Date('2026-06-20T09:15:00Z'),
      isPublic: true,
    },
  })

  // unknown - статус неизвестен
  const v4 = await prisma.vehicle.upsert({
    where: { normalizedPlate: normalizePlate('Х001АА50') },
    update: {},
    create: {
      plate: 'Х001АА50',
      normalizedPlate: normalizePlate('Х001АА50'),
      brand: 'Lada',
      model: 'Vesta',
      status: 'unknown',
      isPublic: true,
    },
  })

  // Привязываем ТС к пользователям
  await prisma.user.update({ where: { id: demo.id }, data: { vehicleId: v1.id } })
  await prisma.user.update({ where: { id: alex.id }, data: { vehicleId: v2.id } })
  await prisma.user.update({ where: { id: kate.id }, data: { vehicleId: v3.id } })

  console.log("Seed выполнен")
}

main().catch(console.error).finally(() => prisma.$disconnect())
