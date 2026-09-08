import { Navigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore.js";

export function GuestRoute({ children }) {
  const authReady = useAppStore((s) => s.authReady);
  const token = useAppStore((s) => s.token);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Restoring session
      </div>
    );
  }

  if (token) return <Navigate to="/overview" replace />;
  return children;
}
