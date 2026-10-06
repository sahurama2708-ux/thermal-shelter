export type AuthProvider = "email" | "google" | "github";

export interface User {
  id: string;
  email: string;
  name: string | null;
  profile_picture: string | null;
  provider: AuthProvider | string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AccessTokenOnly {
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}
