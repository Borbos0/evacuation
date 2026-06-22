'use client'
import { useState, useCallback } from 'react'
import { Navigation } from '@/shared/ui/Navigation'

type SearchState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

interface VehicleResult {
  plate: string
  brand: string | null
  model: string | null
  storageAddress: string | null
  storagePhone: string | null
  storageLat: number | null
  storageLng: number | null
  status: string
  evacuatedAt: string | null
}

const STATUS_LABELS: Record<string, string> = {
  impounded: 'На штрафстоянке',
  released: 'Выдано',
  unknown: 'Неизвестно',
}

export default function HomePage() {
  const [plate, setPlate] = useState('')
  const [state, setState] = useState<SearchState>('idle')
  const [vehicle, setVehicle] = useState<VehicleResult | null>(null)

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!plate.trim()) return
      setState('loading')
      setVehicle(null)

      try {
        const res = await fetch(`/api/vehicles/search?plate=${encodeURIComponent(plate.trim())}`)
        const data = await res.json()

        if (res.status === 429) {
          setState('error')
          return
        }

        if (data.found && data.vehicle) {
          setVehicle(data.vehicle)
          setState('found')
        } else {
          setState('not_found')
        }
      } catch {
        setState('error')
      }
    },
    [plate]
  )

  return (
    <>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2 text-white">Поиск ТС на штрафстоянке</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Введите государственный регистрационный знак автомобиля
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={plate}
            onChange={e => setPlate(e.target.value.toUpperCase())}
            placeholder="А123ВС77"
            className="flex-1 border border-gray-600 rounded-md px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={state === 'loading' || !plate.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {state === 'loading' ? 'Поиск...' : 'Найти'}
          </button>
        </form>

        {state === 'found' && vehicle && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono font-bold text-lg text-white">{vehicle.plate}</p>
                {(vehicle.brand || vehicle.model) && (
                  <p className="text-gray-300 text-sm">
                    {[vehicle.brand, vehicle.model].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  vehicle.status === 'impounded'
                    ? 'bg-red-900 text-red-300'
                    : vehicle.status === 'released'
                    ? 'bg-green-900 text-green-300'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {STATUS_LABELS[vehicle.status] ?? vehicle.status}
              </span>
            </div>

            {vehicle.storageAddress && (
              <p className="text-sm text-gray-100 mb-1">
                <span className="font-medium text-gray-300">Адрес:</span> {vehicle.storageAddress}
              </p>
            )}
            {vehicle.storagePhone && (
              <p className="text-sm text-gray-100 mb-1">
                <span className="font-medium text-gray-300">Телефон:</span>{' '}
                <a href={`tel:${vehicle.storagePhone}`} className="text-blue-400 hover:underline">
                  {vehicle.storagePhone}
                </a>
              </p>
            )}
            {vehicle.evacuatedAt && (
              <p className="text-sm text-gray-100 mb-1">
                <span className="font-medium text-gray-300">Дата эвакуации:</span>{' '}
                {new Date(vehicle.evacuatedAt).toLocaleString('ru-RU')}
              </p>
            )}
            {vehicle.storageLat && vehicle.storageLng && (
              <a
                href={`https://yandex.ru/maps/?pt=${vehicle.storageLng},${vehicle.storageLat}&z=16&l=map`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-blue-400 hover:underline"
              >
                Открыть маршрут на карте
              </a>
            )}
          </div>
        )}

        {state === 'not_found' && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-sm text-yellow-300">
            Автомобиль с ГРЗ <strong>{plate}</strong> не найден в базе штрафстоянок.
          </div>
        )}

        {state === 'error' && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-sm text-red-300">
            Произошла ошибка. Попробуйте ещё раз позже.
          </div>
        )}
      </main>
    </>
  )
}
