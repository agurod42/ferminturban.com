import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminTheme = "light" | "dark";

type AdminThemeContextValue = {
  theme: AdminTheme;
  isDark: boolean;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "admin-theme";

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

const isAdminTheme = (value: unknown): value is AdminTheme =>
  value === "light" || value === "dark";

const getInitialTheme = (): AdminTheme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return isAdminTheme(storedTheme) ? storedTheme : "light";
};

const AdminThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => getInitialTheme());

  const value = useMemo<AdminThemeContextValue>(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme: (nextTheme) => {
        setThemeState(nextTheme);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, nextTheme);
        }
      },
      toggleTheme: () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setThemeState(nextTheme);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, nextTheme);
        }
      },
    }),
    [theme],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <div
        data-admin-theme={theme}
        className={`admin-theme min-h-screen ${theme === "dark" ? "dark" : ""}`}
        style={{ colorScheme: theme }}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);

  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider.");
  }

  return context;
};

export default AdminThemeProvider;
