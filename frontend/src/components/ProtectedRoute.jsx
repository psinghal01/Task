import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "../store/useAppStore.js";

export function ProtectedRoute() {
  const authReady = useAppStore((s) => s.authReady);
  const token = useAppStore((s) => s.token);
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Restoring session
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
