import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Rows3,
  ShieldCheck,
  X,
} from "lucide-react";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import { useAdminSession } from "@/hooks/useAdminSession";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projects", icon: Rows3 },
];

export type AdminBreadcrumb = {
  label: string;
  to?: string;
};

const AdminShell = ({
  title,
  subtitle,
  children,
  headerActions,
  breadcrumbs = [],
  onBeforeNavigate,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  breadcrumbs?: AdminBreadcrumb[];
  onBeforeNavigate?: (to: string) => boolean;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, error, logout } = useAdminSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeNavLabel = useMemo(() => {
    const activeItem = navItems.find((item) =>
      location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to)),
    );

    return activeItem?.label || title;
  }, [location.pathname, title]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/admin/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
      setMobileMenuOpen(false);
    }
  };

  const handleInternalNavigation = (event: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (onBeforeNavigate?.(to) === false) {
      event.preventDefault();
    }

    setMobileMenuOpen(false);
  };

  const renderNavigation = (compact = false) => (
    <nav className={compact ? "space-y-2" : "space-y-1.5"}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          location.pathname === item.to ||
          (item.to !== "/admin" && location.pathname.startsWith(item.to));

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={(event) => handleInternalNavigation(event, item.to)}
            className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 font-body text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            }`}
          >
            <Icon size={17} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="admin-theme-shell min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[290px] shrink-0 border-r border-border/50 bg-secondary/35 px-5 py-6 lg:flex lg:flex-col">
          <Link
            to="/admin"
            onClick={(event) => handleInternalNavigation(event, "/admin")}
            className="rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <ShieldCheck size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-body text-lg font-semibold text-foreground">Admin Workspace</p>
                <p className="font-body text-sm text-muted-foreground">Fermin Turban portfolio CMS</p>
              </div>
            </div>
          </Link>

          <div className="mt-6 rounded-[1.75rem] border border-border/50 bg-card/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Navigation
            </p>
            <div className="mt-4">{renderNavigation()}</div>
          </div>

          <div className="mt-auto rounded-[1.75rem] border border-border/50 bg-card/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Signed in
                </p>
                <p className="mt-2 break-all font-body text-sm font-medium text-foreground">
                  {session.email || "Admin"}
                </p>
              </div>
              <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-body text-xs font-medium text-emerald-700 dark:text-emerald-200">
                Active
              </span>
            </div>

            <div className="mt-5">
              <AdminThemeToggle className="w-full justify-center" />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary disabled:opacity-60"
            >
              <LogOut size={16} />
              <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          <div className="sticky top-0 z-40 -mx-4 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {activeNavLabel}
                </p>
                <p className="mt-1 font-body text-base font-semibold text-foreground">{title}</p>
              </div>

              <div className="flex items-center gap-2">
                <AdminThemeToggle compact />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground"
                  aria-label="Open admin navigation"
                >
                  <Menu size={18} />
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                aria-label="Close admin navigation"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border/50 bg-background px-5 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-body text-base font-semibold text-foreground">Admin Workspace</p>
                    <p className="font-body text-sm text-muted-foreground">{session.email || "Admin"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60"
                    aria-label="Close admin navigation"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-border/50 bg-card/70 p-4">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Navigation
                  </p>
                  <div className="mt-4">{renderNavigation(true)}</div>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-border/50 bg-card/70 p-4">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Session
                  </p>
                  <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                    You are editing live portfolio content in the same runtime environment as the public site.
                  </p>
                  <div className="mt-5">
                    <AdminThemeToggle className="w-full justify-center" />
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground"
                  >
                    <LogOut size={16} />
                    <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-border/50 bg-card/80 p-5 shadow-[0_28px_120px_rgba(0,0,0,0.22)] sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                {breadcrumbs.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {breadcrumbs.map((item, index) => (
                      <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                        {index > 0 ? <ChevronRight size={14} className="text-muted-foreground/70" /> : null}
                        {item.to ? (
                          <Link
                            to={item.to}
                            onClick={(event) => handleInternalNavigation(event, item.to!)}
                            className="font-body transition-colors hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span className="font-body text-foreground">{item.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-1">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Runtime content operations
                  </p>
                  <h1 className="mt-3 font-body text-3xl font-semibold tracking-tight text-foreground sm:text-[2.5rem]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-3 max-w-3xl font-body text-sm leading-7 text-muted-foreground sm:text-[15px]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                <AdminThemeToggle />
                {headerActions}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[1.5rem] border border-destructive/40 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
              Session sync issue: {error}
            </div>
          ) : null}

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
