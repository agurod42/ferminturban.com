import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-[0_40px_100px_rgba(0,0,0,0.28)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden overflow-hidden border-r border-border/40 bg-[radial-gradient(circle_at_top_left,rgba(230,184,74,0.16),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] p-10 lg:block">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.03))]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                  <ShieldCheck size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl tracking-[0.2em] text-foreground">CMS</p>
                  <p className="font-body text-xs uppercase tracking-[0.34em] text-muted-foreground">
                    Portfolio Control
                  </p>
                </div>
              </div>

              <div className="mt-16 space-y-6">
                <p className="font-body text-[10px] uppercase tracking-[0.34em] text-primary">
                  Runtime Publishing
                </p>
                <h1 className="font-display text-5xl leading-none tracking-[0.16em] text-foreground">
                  EDIT THE SITE
                  <br />
                  WITHOUT REDEPLOYING
                </h1>
                <p className="max-w-lg font-body text-base leading-relaxed text-muted-foreground">
                  This panel writes portfolio content to runtime storage and serves it through the
                  same Vercel deployment. Changes go live on the public pages after save.
                </p>
              </div>
            </div>
          </section>

          <section className="p-8 sm:p-10">
            <p className="font-body text-[10px] uppercase tracking-[0.34em] text-primary">
              Admin Access
            </p>
            <h1 className="mt-4 font-display text-4xl tracking-[0.14em] text-foreground">
              SIGN IN
            </h1>
            <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
              Use the owner credentials configured in Vercel environment variables.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <label className="block">
                <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  placeholder="owner@example.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
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
                className="w-full rounded-2xl bg-primary px-5 py-3 font-body text-xs uppercase tracking-[0.28em] text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing In..." : "Enter Admin"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
