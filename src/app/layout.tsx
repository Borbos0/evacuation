import type { Metadata } from "next";
import { getCurrentUser } from "@/server/auth/current-user";
import { AuthProvider } from "@/features/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evacuation App - Поиск ТС на штрафстоянке",
  description: "Поиск транспортного средства на штрафстоянке",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const initialUser = user
    ? {
        id: user.id,
        login: user.login,
        displayName: user.displayName ?? user.login,
        phone: user.phone ?? null,
        email: user.email ?? null,
        isAdmin: user.isAdmin,
      }
    : null;

  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-900 text-gray-100">
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  );
}
