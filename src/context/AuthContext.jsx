import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data?.access_token) {
      localStorage.setItem("nx_access_token", data.access_token);
    }
    // Fetch full user (with permissions) from /me
    try {
      const { data: me } = await api.get("/auth/me");
      setUser({ ...me, must_change_password: data.must_change_password });
    } catch {
      setUser({
        id: data.id, email: data.email, name: data.name, role: data.role,
        must_change_password: data.must_change_password,
      });
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    localStorage.removeItem("nx_access_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, logout, refresh: checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
