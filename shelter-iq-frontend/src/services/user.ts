import { api, unwrap } from "./api";
import type { User } from "../types/auth";
import type { UserUpdatePayload } from "../types/user";
import type { ApiEnvelope } from "../types/api";

export function getMe(): Promise<User> {
  return unwrap(api.get<ApiEnvelope<User>>("/api/v1/users/me"));
}

export function updateMe(payload: UserUpdatePayload): Promise<User> {
  return unwrap(api.patch<ApiEnvelope<User>>("/api/v1/users/me", payload));
}

export function deleteMe(): Promise<void> {
  return api.delete("/api/v1/users/me").then(() => undefined);
}
