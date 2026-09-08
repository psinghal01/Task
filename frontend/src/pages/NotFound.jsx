import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted">That route is not part of Campus Pulse.</p>
      <Link to="/overview" className="mt-6 inline-block text-sm underline underline-offset-2">
        Back to overview
      </Link>
    </div>
  );
}
