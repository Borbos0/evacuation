import 'server-only'
import { prisma } from '@/server/db/client'
import { normalizePlate } from '@/shared/lib/normalize-plate'

const PUBLIC_VEHICLE_SELECT = {
  plate: true,
  brand: true,
  model: true,
  storageAddress: true,
  storagePhone: true,
  storageLat: true,
  storageLng: true,
  status: true,
  evacuatedAt: true,
} as const

export const vehicleRepository = {
  findPublicByPlate: (plate: string) =>
    prisma.vehicle.findFirst({
      where: { normalizedPlate: normalizePlate(plate), isPublic: true },
      select: PUBLIC_VEHICLE_SELECT,
    }),

  findById: (id: string) => prisma.vehicle.findUnique({ where: { id } }),

  findAll: () => prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } }),

  create: (data: Parameters<typeof prisma.vehicle.create>[0]['data']) =>
    prisma.vehicle.create({ data }),

  update: (id: string, data: Parameters<typeof prisma.vehicle.update>[0]['data']) =>
    prisma.vehicle.update({ where: { id }, data }),

  delete: (id: string) => prisma.vehicle.delete({ where: { id } }),
}
