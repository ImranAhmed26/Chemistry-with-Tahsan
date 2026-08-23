"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, setToken, getToken } from "@/lib/api";
import type { AuthUser, LoginResponse, Tenant } from "@/types";

const USER_KEY = "cwt_user";
const TENANT_KEY = "cwt_tenant";

interface AuthContextValue {
  user: AuthUser | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // One-time hydration of auth state from localStorage on mount; this must
    // run client-side only (SSR has no localStorage), hence the effect.
    const token = getToken();
    if (token) {
      try {
        const rawUser = window.localStorage.getItem(USER_KEY);
        const rawTenant = window.localStorage.getItem(TENANT_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (rawUser) setUser(JSON.parse(rawUser));
        if (rawTenant) setTenant(JSON.parse(rawTenant));
      } catch {
        // ignore malformed cache
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<LoginResponse>(
      "/auth/login",
      { email, password },
      false
    );
    setToken(res.accessToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    window.localStorage.setItem(TENANT_KEY, JSON.stringify(res.tenant));
    setUser(res.user);
    setTenant(res.tenant);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(TENANT_KEY);
    setUser(null);
    setTenant(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
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
