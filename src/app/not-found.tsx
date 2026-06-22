import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">404 - Страница не найдена</h1>
        <p className="text-gray-600 mb-4">
          Запрошенная страница не существует.
        </p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          На главную
        </Link>
      </div>
    </main>
  );
}
