import { useMemo, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminInset, AdminPanel, AdminSectionHeading } from "@/components/admin/AdminSurface";
import { useAdminSession } from "@/hooks/useAdminSession";

const MIN_PASSWORD_LENGTH = 12;

const AdminSecurity = () => {
  const { session, changePassword, isLoading } = useAdminSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const statusLines = useMemo(
    () => [
      `Signed in as ${session.email || "Admin"}`,
      session.expiresAt
        ? `Current session expires ${new Date(session.expiresAt).toLocaleString()}`
        : "Session expiry will refresh after the next successful password update",
    ],
    [session.email, session.expiresAt],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match.");
      return;
    }

    setSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated. Older admin sessions now need to sign in again.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell
      title="Security"
      subtitle="Rotate the admin password from the live workspace without leaving the runtime environment."
      breadcrumbs={[{ label: "Security" }]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <AdminPanel className="p-5 sm:p-6 lg:p-8">
          <AdminSectionHeading
            eyebrow="Credential rotation"
            title="Change admin password"
            description="Provide the current password, choose a new one, and confirm it. A successful update invalidates older admin sessions."
          />

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="font-body text-sm font-medium text-foreground">Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="••••••••••••"
                required
              />
            </label>

            <div className="grid gap-5 lg:grid-cols-2">
              <label className="block">
                <span className="font-body text-sm font-medium text-foreground">New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  placeholder="Use at least 12 characters"
                  required
                />
              </label>

              <label className="block">
                <span className="font-body text-sm font-medium text-foreground">Confirm new password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  placeholder="Repeat the new password"
                  required
                />
              </label>
            </div>

            <AdminInset className="px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                  <KeyRound size={16} />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">Password policy</p>
                  <p className="mt-1 font-body text-sm leading-6 text-muted-foreground">
                    Use at least {MIN_PASSWORD_LENGTH} characters. Reusing the current password is blocked.
                  </p>
                </div>
              </div>
            </AdminInset>

            {error ? (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-body text-sm text-emerald-700 dark:text-emerald-200">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-5 py-3 font-body text-sm font-medium text-primary-foreground transition-transform hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Updating password..." : "Update password"}
            </button>
          </form>
        </AdminPanel>

        <AdminPanel className="p-5 sm:p-6">
          <AdminSectionHeading
            eyebrow="Session status"
            title="Current access"
            description="The admin session is tied to the stored credential version. Password changes revoke older cookies issued before the rotation."
          />

          <div className="mt-6 space-y-3">
            {statusLines.map((line) => (
              <AdminInset key={line} className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
                    <ShieldCheck size={16} />
                  </div>
                  <p className="font-body text-sm leading-6 text-foreground">{line}</p>
                </div>
              </AdminInset>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
};

export default AdminSecurity;
