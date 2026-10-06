import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { STORAGE_KEYS } from "../utils/constants";
import type { AccessTokenOnly } from "../types/auth";
import type { ApiEnvelope, ApiSuccess } from "../types/api";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate, interceptor-free client used only for the refresh call itself,
// so a failing refresh never recurses back into the 401 handler below.
const refreshClient = axios.create({ baseURL });

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Queue of callbacks waiting on an in-flight refresh, so concurrent 401s
// trigger exactly one /auth/refresh call instead of a stampede.
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

/** Callback invoked when a refresh attempt ultimately fails — wired up by AuthContext. */
let onRefreshFailed: (() => void) | null = null;
export function setOnRefreshFailed(cb: () => void) {
  onRefreshFailed = cb;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (status !== 401 || !originalRequest || originalRequest._retried || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      onRefreshFailed?.();
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    if (isRefreshing) {
      // Wait for the in-flight refresh to finish, then retry with its result.
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await refreshClient.post<ApiEnvelope<AccessTokenOnly>>(
        "/api/v1/auth/refresh",
        { refresh_token: refreshToken }
      );

      if (!data.success) {
        throw new Error(data.error.message);
      }

      const newAccessToken = (data as ApiSuccess<AccessTokenOnly>).data.access_token;
      setTokens(newAccessToken);
      resolveQueue(newAccessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      resolveQueue(null);
      onRefreshFailed?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/** Unwraps the { success, data } envelope, throwing the raw axios error on failure so normalizeError can handle it upstream. */
export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data: envelope } = await promise;
  if (!envelope.success) {
    throw Object.assign(new Error(envelope.error.message), { code: envelope.error.code });
  }
  return envelope.data;
}
