import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, PlusSquare, Rows3, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAdminSession } from "@/hooks/useAdminSession";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projects", icon: Rows3 },
  { to: "/admin/projects/new", label: "New Project", icon: PlusSquare },
];

const AdminShell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAdminSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/admin/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r border-border/50 bg-secondary/20 p-6 lg:flex lg:flex-col">
          <Link to="/admin" className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
              <ShieldCheck size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-display text-xl tracking-[0.18em] text-foreground">CMS</p>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Fermin Turban
              </p>
            </div>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                location.pathname === item.to ||
                (item.to !== "/admin" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-border/50 bg-card/60 p-4">
            <p className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Signed in
            </p>
            <p className="mt-2 break-all font-body text-sm text-foreground">
              {session.email || "Admin"}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
            >
              <LogOut size={15} />
              <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-5 sm:p-8">
          <div className="mb-6 rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.35em] text-primary">
                  Runtime CMS
                </p>
                <h1 className="mt-3 font-display text-3xl tracking-[0.14em] text-foreground sm:text-4xl">
                  {title.toUpperCase()}
                </h1>
                {subtitle ? (
                  <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2 lg:hidden">
                {navItems.map((item) => {
                  const active =
                    location.pathname === item.to ||
                    (item.to !== "/admin" && location.pathname.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60 text-muted-foreground hover:border-primary hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
