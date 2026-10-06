import { api, unwrap } from "./api";
import type { LoginPayload, RegisterPayload, TokenPair, User } from "../types/auth";
import type { ApiEnvelope } from "../types/api";

export function register(payload: RegisterPayload): Promise<TokenPair> {
  return unwrap(api.post<ApiEnvelope<TokenPair>>("/api/v1/auth/register", payload));
}

export function login(payload: LoginPayload): Promise<TokenPair> {
  return unwrap(api.post<ApiEnvelope<TokenPair>>("/api/v1/auth/login", payload));
}

export function logout(refreshToken: string | null): Promise<{ message: string }> {
  return unwrap(
    api.post<ApiEnvelope<{ message: string }>>("/api/v1/auth/logout", {
      refresh_token: refreshToken ?? undefined,
    })
  );
}

export function getCurrentUser(): Promise<User> {
  return unwrap(api.get<ApiEnvelope<User>>("/api/v1/auth/me"));
}

/** Builds the full backend URL that starts the OAuth redirect dance. Not an XHR call — used as a navigation target. */
export function oauthRedirectUrl(provider: "google" | "github"): string {
  const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  return `${baseURL}/api/v1/auth/${provider}/login`;
}
