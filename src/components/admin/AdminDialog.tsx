import { useEffect, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

type AdminDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: "default" | "destructive" | "warning";
  children?: ReactNode;
};

const toneClassNames: Record<NonNullable<AdminDialogProps["tone"]>, string> = {
  default: "border-border/60 bg-card/95 text-foreground",
  destructive: "border-destructive/40 bg-card/95 text-foreground",
  warning: "border-primary/30 bg-card/95 text-foreground",
};

const confirmButtonClassNames: Record<NonNullable<AdminDialogProps["tone"]>, string> = {
  default: "bg-primary text-primary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  warning: "bg-primary text-primary-foreground",
};

const iconClassNames: Record<NonNullable<AdminDialogProps["tone"]>, string> = {
  default: "border-border/60 bg-secondary/40 text-foreground",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  warning: "border-primary/30 bg-primary/10 text-primary",
};

const AdminDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  tone = "default",
  children,
}: AdminDialogProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        className={`relative w-full max-w-xl rounded-[1.75rem] border p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] ${toneClassNames[tone]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${iconClassNames[tone]}`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 id="admin-dialog-title" className="font-body text-xl font-semibold text-foreground">
                {title}
              </h2>
              {description ? (
                <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {children ? (
          <div className="mt-5 rounded-2xl border border-border/50 bg-secondary/20 p-4">
            {children}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 font-body text-sm font-medium ${confirmButtonClassNames[tone]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDialog;
