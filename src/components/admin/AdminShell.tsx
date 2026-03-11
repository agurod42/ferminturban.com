import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Menu,
  Rows3,
  ShieldCheck,
  X,
} from "lucide-react";
import { AdminInset, AdminPanel } from "@/components/admin/AdminSurface";
import AdminUserMenu, { AdminSessionPanel } from "@/components/admin/AdminUserMenu";
import { useAdminSession } from "@/hooks/useAdminSession";

const navItems = [
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
      location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
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
          location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

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
        <aside className="hidden w-[282px] shrink-0 border-r border-border/35 bg-secondary/18 px-5 py-6 lg:flex lg:flex-col">
          <Link
            to="/admin/projects"
            onClick={(event) => handleInternalNavigation(event, "/admin/projects")}
            className="border-b border-border/35 pb-6"
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

          <div className="mt-6">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Navigation
            </p>
            <div className="mt-3">{renderNavigation()}</div>
          </div>

          <p className="mt-auto pt-6 font-body text-sm leading-6 text-muted-foreground">
            Editorial workspace connected to the same runtime APIs as the public site.
          </p>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          <div className="sticky top-0 z-40 -mx-4 border-b border-border/35 bg-background/92 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {activeNavLabel}
                </p>
                <p className="mt-1 font-body text-base font-semibold text-foreground">{title}</p>
              </div>

              <div className="flex items-center gap-2">
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
              <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border/35 bg-background px-5 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-body text-base font-semibold text-foreground">Admin Workspace</p>
                    <p className="font-body text-sm text-muted-foreground">Navigation and session controls</p>
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

                <AdminPanel className="mt-6 p-4 shadow-none">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Navigation
                  </p>
                  <div className="mt-4">{renderNavigation(true)}</div>
                </AdminPanel>

                <AdminSessionPanel
                  email={session.email}
                  isLoggingOut={isLoggingOut}
                  onLogout={handleLogout}
                  className="mt-4 bg-card/68 shadow-none"
                />
              </div>
            </div>
          ) : null}

          <div className="border-b border-border/35 pb-6">
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
                {headerActions ? (
                  <div className="flex flex-wrap items-center gap-3 xl:justify-end">{headerActions}</div>
                ) : null}
                <div className="hidden lg:block">
                  <AdminUserMenu
                    email={session.email}
                    isLoggingOut={isLoggingOut}
                    onLogout={handleLogout}
                  />
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <AdminInset className="mt-4 border-destructive/30 bg-destructive/8 px-4 py-3 text-destructive">
              Session sync issue: {error}
            </AdminInset>
          ) : null}

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
