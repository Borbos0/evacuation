import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";
import { Navigation } from "@/shared/ui/Navigation";
import { LogoutButton } from "./LogoutButton";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const vehicle = user.vehicleId
    ? await prisma.vehicle.findUnique({
        where: { id: user.vehicleId },
        select: {
          plate: true,
          brand: true,
          model: true,
          storageAddress: true,
          storagePhone: true,
          status: true,
          evacuatedAt: true,
        },
      })
    : null;

  const displayName = user.displayName ?? user.login;

  return (
    <>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h1 className="text-xl font-bold mb-4 text-white">{displayName}</h1>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400 w-32">Логин:</dt>
              <dd className="text-gray-100">{user.login}</dd>
            </div>
            {user.phone && (
              <div className="flex gap-2">
                <dt className="text-gray-400 w-32">Телефон:</dt>
                <dd className="text-gray-100">{user.phone}</dd>
              </div>
            )}
            {user.email && (
              <div className="flex gap-2">
                <dt className="text-gray-400 w-32">Email:</dt>
                <dd className="text-gray-100">{user.email}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <LogoutButton />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="font-semibold text-white mb-3">Мой автомобиль</h2>
          {vehicle ? (
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-gray-400 w-36">ГРЗ:</dt>
                <dd className="font-mono font-bold text-white">
                  {vehicle.plate}
                </dd>
              </div>
              {(vehicle.brand || vehicle.model) && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-36">Марка / Модель:</dt>
                  <dd className="text-gray-100">
                    {[vehicle.brand, vehicle.model].filter(Boolean).join(" ")}
                  </dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="text-gray-400 w-36">Статус:</dt>
                <dd>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      vehicle.status === "impounded"
                        ? "bg-red-900 text-red-300"
                        : vehicle.status === "released"
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {vehicle.status === "impounded"
                      ? "На штрафстоянке"
                      : vehicle.status === "released"
                        ? "Выдано"
                        : "Неизвестно"}
                  </span>
                </dd>
              </div>
              {vehicle.storageAddress && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-36">Адрес стоянки:</dt>
                  <dd className="text-gray-100">{vehicle.storageAddress}</dd>
                </div>
              )}
              {vehicle.storagePhone && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-36">Телефон стоянки:</dt>
                  <dd>
                    <a
                      href={`tel:${vehicle.storagePhone}`}
                      className="text-blue-400 hover:underline"
                    >
                      {vehicle.storagePhone}
                    </a>
                  </dd>
                </div>
              )}
              {vehicle.evacuatedAt && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-36">Дата эвакуации:</dt>
                  <dd className="text-gray-100">
                    {new Date(vehicle.evacuatedAt).toLocaleString("ru-RU")}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-gray-400 text-sm">Машина не привязана</p>
          )}
        </div>
      </main>
    </>
  );
}
