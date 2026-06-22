import { checkAdminAuth } from '@/server/security/admin-auth'
import { vehicleRepository } from '@/server/repositories/vehicle.repository'
import { normalizePlate } from '@/shared/lib/normalize-plate'
import { z } from 'zod'

const createVehicleSchema = z.object({
  plate: z.string().min(1).max(20),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  storageAddress: z.string().max(500).optional(),
  storagePhone: z.string().max(30).optional(),
  storageLat: z.coerce.number().optional(),
  storageLng: z.coerce.number().optional(),
  status: z.string().default('unknown'),
  isPublic: z.coerce.boolean().default(false),
})

export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Доступ запрещён' } }, { status: 401 })
  }
  const vehicles = await vehicleRepository.findAll()
  return Response.json({ vehicles })
}

export async function POST(request: Request) {
  if (!checkAdminAuth(request)) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Доступ запрещён' } }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = createVehicleSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Неверные данные', details: parsed.error.flatten() } },
      { status: 400 }
    )
  }

  const normalized = normalizePlate(parsed.data.plate)
  const vehicle = await vehicleRepository.create({
    ...parsed.data,
    normalizedPlate: normalized,
  })
  return Response.json({ vehicle }, { status: 201 })
}
