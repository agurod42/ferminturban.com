import { ChevronDown } from "lucide-react";
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";

type AdminSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  containerClassName?: string;
  leading?: ReactNode;
};

const baseSelectClassName =
  "min-h-11 w-full appearance-none rounded-2xl border border-border/60 bg-secondary/20 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary";

const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ children, className = "", containerClassName = "", leading, ...props }, ref) => (
    <div className={`relative ${containerClassName}`.trim()}>
      {leading ? (
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {leading}
        </div>
      ) : null}
      <select
        ref={ref}
        className={`${baseSelectClassName} ${leading ? "pl-11" : ""} pr-11 ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  ),
);

AdminSelect.displayName = "AdminSelect";

export default AdminSelect;
