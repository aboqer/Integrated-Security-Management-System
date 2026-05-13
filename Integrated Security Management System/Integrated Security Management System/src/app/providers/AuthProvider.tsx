import React, { createContext, useContext, useMemo, useState } from "react";
import { api, clearStoredToken, setStoredToken } from "../../services/api";

export interface AuthUser {
  id: string;
  username: string;
  fullName?: string;
  roleCode?: string;
  departmentId?: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AUTH_USER_KEY = "auth_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      async login(username: string, password: string) {
        const response = await api.login(username, password);
        setStoredToken(response.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        setUser(response.user);
      },
      logout() {
        clearStoredToken();
        localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
