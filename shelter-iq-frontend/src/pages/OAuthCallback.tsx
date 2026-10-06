import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import Logo from "../components/common/Logo";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { normalizeError } from "../utils/errors";

/**
 * Lands after the backend's /auth/{google,github}/callback redirects here
 * with ?access_token=...&refresh_token=... (see app/routers/auth.py).
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { applyTokensAndFetchUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"working" | "error">("working");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setStatus("error");
      return;
    }

    applyTokensAndFetchUser(accessToken, refreshToken)
      .then(() => {
        showToast("Signed in successfully", "success");
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        console.error(normalizeError(err).message);
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-sky bg-blueprint px-6 text-center">
      <Logo size={36} />

      {status === "working" ? (
        <div className="mt-10 flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary-400" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-6 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <Spinner /> Completing secure sign in...
          </p>
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <p className="mt-6 font-display text-lg font-semibold text-ink-900">Authentication failed</p>
          <p className="mt-1.5 max-w-sm text-sm text-ink-400">Please try again.</p>
          <Link to="/login" className="btn-primary mt-6">
            Return to Login
          </Link>
        </div>
      )}
    </div>
  );
}
