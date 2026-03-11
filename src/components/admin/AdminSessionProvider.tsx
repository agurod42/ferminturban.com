import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiJson } from "@/lib/api";
import { AdminSessionContext, defaultAdminSession } from "@/lib/admin/session-context";
import type { AdminSession, AdminSessionResponse } from "@/types/project";

const AdminSessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AdminSession>(defaultAdminSession);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const payload = await apiJson<AdminSessionResponse>("/api/admin/session");
      setSession(payload.session);
      setError(null);
    } catch (caughtError) {
      setSession(defaultAdminSession);
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load session.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const payload = await apiJson<AdminSessionResponse>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(payload.session);
      setError(null);
    } catch (caughtError) {
      setSession(defaultAdminSession);
      setError(caughtError instanceof Error ? caughtError.message : "Invalid credentials.");
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmPassword: string) => {
      const payload = await apiJson<AdminSessionResponse>("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      setSession(payload.session);
      setError(null);
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await apiJson<{ ok: boolean }>("/api/admin/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setSession(defaultAdminSession);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to end session.");
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      error,
      refresh,
      login,
      changePassword,
      logout,
    }),
    [changePassword, error, isLoading, login, logout, refresh, session],
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
};

export default AdminSessionProvider;
