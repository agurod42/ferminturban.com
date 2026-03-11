import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminSession } from "@/hooks/useAdminSession";

const AdminRoute = () => {
  const { session, isLoading } = useAdminSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="rounded-3xl border border-border/50 bg-card/70 px-8 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <p className="font-body text-[10px] uppercase tracking-[0.35em] text-primary">
              Admin
            </p>
            <p className="mt-4 font-display text-2xl tracking-[0.16em] text-foreground">
              LOADING SESSION
            </p>
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
