import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminSession } from "@/hooks/useAdminSession";

const AdminRoute = () => {
  const { session, isLoading } = useAdminSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="admin-theme-shell min-h-screen text-foreground">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="w-full max-w-xl rounded-[2rem] border border-border/50 bg-card/80 px-8 py-10 shadow-[0_24px_80px_rgba(41,28,20,0.12)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Admin session
            </p>
            <p className="mt-4 font-body text-2xl font-semibold tracking-tight text-foreground">
              Checking access
            </p>
            <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">
              Verifying the signed-in session before loading the editorial workspace.
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-secondary/50">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session.authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default AdminRoute;
