import type { HTMLAttributes, ReactNode } from "react";

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const AdminPanel = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={joinClasses(
      "rounded-[1.5rem] border border-border/45 bg-card/72 shadow-[0_10px_32px_rgba(41,28,20,0.08)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.16)]",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const AdminInset = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={joinClasses(
      "rounded-[1.2rem] border border-border/35 bg-secondary/18",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const AdminDivider = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={joinClasses("border-t border-border/35", className)} {...props} />
);

export const AdminSectionHeading = ({
  title,
  description,
  eyebrow,
  className,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  className?: string;
}) => (
  <div className={joinClasses("flex flex-col gap-2", className)}>
    {eyebrow ? (
      <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
    ) : null}
    <p className="font-body text-lg font-semibold text-foreground">{title}</p>
    {description ? (
      <p className="font-body text-sm leading-6 text-muted-foreground">{description}</p>
    ) : null}
  </div>
);
