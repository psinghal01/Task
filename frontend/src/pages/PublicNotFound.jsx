import { Link } from "react-router-dom";
import { PATHS } from "../lib/paths.js";

export function PublicNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
      <h1 className="mt-6 text-2xl font-medium tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted">That address is not part of Campus Pulse.</p>
      <Link to={PATHS.home} className="mt-6 text-sm underline underline-offset-2">
        Back to home
      </Link>
    </div>
  );
}
