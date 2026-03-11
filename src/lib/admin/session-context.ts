import { createContext } from "react";
import type { AdminSession } from "@/types/project";

export type AdminSessionContextValue = {
  session: AdminSession;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

export const defaultAdminSession: AdminSession = {
  authenticated: false,
};

export const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);
