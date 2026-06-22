"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  login: string;
  displayName: string;
  phone: string | null;
  email: string | null;
  isAdmin: boolean;
}

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
