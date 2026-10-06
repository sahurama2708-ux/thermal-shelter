import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as authService from "../services/auth";
import { clearTokens, getAccessToken, getRefreshToken, setOnRefreshFailed, setTokens } from "../services/api";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";
import { normalizeError } from "../utils/errors";
import { useToast } from "./ToastContext";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginWithGithub: () => void;
  getCurrentUser: () => Promise<User>;
  applyTokensAndFetchUser: (accessToken: string, refreshToken: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  // Wire the axios layer's "refresh ultimately failed" event to a clean logout,
  // without axios needing to know about React state at all.
  useEffect(() => {
    setOnRefreshFailed(() => {
      setUser(null);
      showToastRef.current("Session expired. Please sign in again.", "info");
    });
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await authService.login(payload);
    setTokens(tokens.access_token, tokens.refresh_token);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const tokens = await authService.register(payload);
    setTokens(tokens.access_token, tokens.refresh_token);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      await authService.logout(refreshToken);
    } catch (err) {
      // Logout is best-effort server-side (stateless JWTs) — always clear locally.
      console.warn("Logout request failed:", normalizeError(err).message);
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    window.location.href = authService.oauthRedirectUrl("google");
  }, []);

  const loginWithGithub = useCallback(() => {
    window.location.href = authService.oauthRedirectUrl("github");
  }, []);

  const applyTokensAndFetchUser = useCallback(async (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithGithub,
        getCurrentUser: authService.getCurrentUser,
        applyTokensAndFetchUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
