import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import Logo from "../components/common/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-sky bg-blueprint px-6 text-center">
      <Logo size={32} />
      <p className="mt-10 font-display text-6xl font-semibold text-primary-200">404</p>
      <h1 className="mt-3 font-display text-xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-1.5 max-w-sm text-sm text-ink-400">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <Home className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
}
