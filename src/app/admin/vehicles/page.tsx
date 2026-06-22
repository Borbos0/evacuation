import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { vehicleRepository } from "@/server/repositories/vehicle.repository";
import { Navigation } from "@/shared/ui/Navigation";

export default async function AdminVehiclesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/vehicles");
  if (!user.isAdmin) redirect("/");

  const vehicles = await vehicleRepository.findAll();

  return (
    <>
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6 text-white">Управление ТС</h1>
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
                <th className="text-left px-4 py-3 border-b border-gray-600">
                  ГРЗ
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-600">
                  Марка / Модель
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-600">
                  Статус
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-600">
                  Публичный
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-600">
                  Создан
                </th>
                <th className="text-left px-4 py-3 border-b border-gray-600">
                  Карта
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, i) => (
                <tr
                  key={v.id}
                  className={`text-gray-100 hover:bg-gray-700 transition-colors ${
                    i < vehicles.length - 1 ? "border-b border-gray-700" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-medium">{v.plate}</td>
                  <td className="px-4 py-3">
                    {[v.brand, v.model].filter(Boolean).join(" ") || (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        v.status === "impounded"
                          ? "bg-red-900 text-red-300"
                          : v.status === "released"
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {v.status === "impounded"
                        ? "На стоянке"
                        : v.status === "released"
                          ? "Выдано"
                          : "Неизвестно"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {v.isPublic ? "Да" : "Нет"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(v.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3">
                    {v.storageLat && v.storageLng ? (
                      <a
                        href={`https://yandex.ru/maps/?pt=${v.storageLng},${v.storageLat}&z=16&l=map`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Открыть
                      </a>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicles.length === 0 && (
            <p className="text-gray-400 text-sm p-4">Нет данных</p>
          )}
        </div>
      </main>
    </>
  );
}
