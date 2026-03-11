import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";

type AdminSessionPanelProps = {
  email?: string;
  isLoggingOut?: boolean;
  onLogout: () => void | Promise<void>;
  onRequestClose?: () => void;
  className?: string;
};

const getSessionLabel = (email?: string) => email || "Admin";

const getSessionHandle = (email?: string) => {
  if (!email) {
    return "Admin session";
  }

  const [handle] = email.split("@");
  return handle || email;
};

const getSessionInitial = (email?: string) => {
  const trimmedEmail = email?.trim();
  return trimmedEmail ? trimmedEmail.charAt(0).toUpperCase() : "A";
};

export const AdminSessionPanel = ({
  email,
  isLoggingOut = false,
  onLogout,
  onRequestClose,
  className = "",
}: AdminSessionPanelProps) => {
  const label = getSessionLabel(email);
  const initial = getSessionInitial(email);

  return (
    <div
      className={`rounded-[1.5rem] border border-border/50 bg-card/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.16)] ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-body text-sm font-semibold text-primary">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Signed in
            </p>
            <p className="mt-1 truncate font-body text-sm font-semibold text-foreground">{label}</p>
          </div>
        </div>
        <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-body text-xs font-medium text-emerald-700 dark:text-emerald-200">
          Active
        </span>
      </div>

      <p className="mt-4 font-body text-sm leading-6 text-muted-foreground">
        You are editing live portfolio content in the same runtime environment as the public site.
      </p>

      <div className="mt-5 space-y-3">
        <AdminThemeToggle className="w-full justify-center" />
        <button
          type="button"
          onClick={() => {
            onRequestClose?.();
            void onLogout();
          }}
          disabled={isLoggingOut}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary disabled:opacity-60"
        >
          <LogOut size={16} />
          <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
};

const AdminUserMenu = ({
  email,
  isLoggingOut = false,
  onLogout,
  className = "",
}: Omit<AdminSessionPanelProps, "onRequestClose">) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const handle = getSessionHandle(email);
  const label = getSessionLabel(email);
  const initial = getSessionInitial(email);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex min-h-12 max-w-full items-center gap-3 rounded-[1.6rem] border border-border/60 bg-card/85 px-3.5 py-2.5 text-left shadow-[0_16px_40px_rgba(0,0,0,0.12)] outline-none transition-colors hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-body text-sm font-semibold text-primary">
          {initial}
        </div>

        <div className="min-w-0">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Session
          </p>
          <p className="mt-1 max-w-[220px] truncate font-body text-sm font-medium text-foreground">
            {label}
          </p>
        </div>

        <div className="hidden rounded-full border border-border/60 bg-secondary/35 px-2.5 py-1 font-body text-xs font-medium text-muted-foreground xl:inline-flex">
          {handle}
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Session menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-96 max-w-[calc(100vw-2rem)]"
        >
          <AdminSessionPanel
            email={email}
            isLoggingOut={isLoggingOut}
            onLogout={onLogout}
            onRequestClose={() => setIsOpen(false)}
            className="shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
          />
        </div>
      ) : null}
    </div>
  );
};

export default AdminUserMenu;
