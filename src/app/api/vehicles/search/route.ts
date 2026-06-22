import { normalizePlate, isValidPlate } from '@/shared/lib/normalize-plate'
import { vehicleRepository } from '@/server/repositories/vehicle.repository'
import { rateLimiter, getClientIp } from '@/server/security/rate-limiter'

export async function GET(request: Request) {
  const ip = getClientIp(request)
  if (!rateLimiter.searchPerMinute(ip)) {
    return Response.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Слишком много запросов.' } },
      { status: 429 }
    )
  }

  const plate = new URL(request.url).searchParams.get('plate') ?? ''
  const normalized = normalizePlate(plate)

  if (!plate || !isValidPlate(normalized)) {
    return Response.json({ found: false })
  }

  const vehicle = await vehicleRepository.findPublicByPlate(normalized)
  if (!vehicle) return Response.json({ found: false })

  return Response.json({ found: true, vehicle })
}
