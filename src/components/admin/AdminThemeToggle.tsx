import { MoonStar, SunMedium } from "lucide-react";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";

const AdminThemeToggle = ({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) => {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";
  const Icon = isDark ? MoonStar : SunMedium;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/80 text-foreground transition-colors hover:border-primary ${compact ? "h-11 w-11" : "min-h-11 px-4 py-3 font-body text-sm font-medium"} ${className}`.trim()}
    >
      <Icon size={compact ? 18 : 16} />
      {compact ? null : <span>{isDark ? "Dark mode" : "Light mode"}</span>}
    </button>
  );
};

export default AdminThemeToggle;
