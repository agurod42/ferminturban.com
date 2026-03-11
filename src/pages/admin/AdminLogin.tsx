import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useAdminSession } from "@/hooks/useAdminSession";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, login, isLoading } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from =
    typeof location.state === "object" &&
    location.state &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : "/admin/projects";

  if (!isLoading && session.authenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-theme-shell min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border/50 bg-card/90 shadow-[0_40px_100px_rgba(41,28,20,0.14)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.28)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="admin-theme-hero-panel relative hidden border-r border-border/40 p-10 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <ShieldCheck size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-body text-xl font-semibold text-foreground">Admin Workspace</p>
                <p className="font-body text-sm text-muted-foreground">Fermin Turban portfolio CMS</p>
              </div>
            </div>

            <div className="mt-14">
              <p className="font-body text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Editorial control
              </p>
              <h1 className="mt-4 font-body text-5xl font-semibold leading-tight tracking-tight text-foreground">
                Update portfolio content without leaving the live runtime flow.
              </h1>
              <p className="mt-5 max-w-xl font-body text-base leading-8 text-muted-foreground">
                Sign in to create drafts, publish finished work, update media, and keep the live site aligned with the latest editorial changes.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {[
                "Draft and publish projects with explicit status changes",
                "Upload images directly into the runtime media flow",
                "Review content issues before anything goes live",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-border/50 bg-secondary/20 px-4 py-4">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
                    <CheckCircle2 size={15} />
                  </div>
                  <p className="font-body text-sm leading-6 text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 sm:p-10">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Admin sign in
            </p>
            <h1 className="mt-4 font-body text-4xl font-semibold tracking-tight text-foreground">
              Access the content workspace
            </h1>
            <p className="mt-4 max-w-md font-body text-sm leading-7 text-muted-foreground">
              Use the admin credentials for this site to continue editing the portfolio.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <label className="block">
                <span className="font-body text-sm font-medium text-foreground">Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  placeholder="owner@example.com"
                  required
                />
              </label>

              <label className="block">
                <span className="font-body text-sm font-medium text-foreground">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  placeholder="••••••••••"
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 font-body text-sm font-medium text-primary-foreground transition-transform hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Enter workspace"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
