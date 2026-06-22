import { checkAdminAuth } from '@/server/security/admin-auth'
import { vehicleRepository } from '@/server/repositories/vehicle.repository'
import { normalizePlate } from '@/shared/lib/normalize-plate'
import { z } from 'zod'

const updateVehicleSchema = z.object({
  plate: z.string().min(1).max(20).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  storageAddress: z.string().max(500).optional(),
  storagePhone: z.string().max(30).optional(),
  storageLat: z.coerce.number().optional(),
  storageLng: z.coerce.number().optional(),
  status: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
  evacuatedAt: z.string().datetime().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Доступ запрещён' } }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = updateVehicleSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Неверные данные' } },
      { status: 400 }
    )
  }

  const data: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.plate) {
    data.normalizedPlate = normalizePlate(parsed.data.plate)
  }

  const vehicle = await vehicleRepository.update(id, data)
  return Response.json({ vehicle })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Доступ запрещён' } }, { status: 401 })
  }

  const { id } = await params
  await vehicleRepository.delete(id)
  return Response.json({ success: true })
}
