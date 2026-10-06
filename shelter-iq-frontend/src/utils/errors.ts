import axios from "axios";
import type { AppError } from "../types/api";

/**
 * The backend wraps every error as { success: false, error: { code, message } }
 * (see app/utils/responses.py + main.py exception handlers). This turns any
 * thrown error — axios or otherwise — into a consistent, human-readable shape.
 */
export function normalizeError(err: unknown, fallback = "Something went wrong. Please try again."): AppError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;

    if (!err.response) {
      return {
        code: "NETWORK_ERROR",
        message:
          "Can't reach the server. Check your connection or try again shortly.",
        status,
      };
    }

    const body = err.response.data as
      | { success?: false; error?: { code?: string; message?: string } }
      | undefined;

    if (body?.error?.message) {
      return {
        code: body.error.code ?? "API_ERROR",
        message: body.error.message,
        status,
      };
    }

    if (status === 401) {
      return { code: "UNAUTHENTICATED", message: "Your session has expired. Please sign in again.", status };
    }

    if (status === 502) {
      return {
        code: "UPSTREAM_UNAVAILABLE",
        message: "Climate data is temporarily unavailable. Please try again.",
        status,
      };
    }

    if (status === 422) {
      return { code: "VALIDATION_ERROR", message: "Please check the values you entered.", status };
    }

    return { code: "API_ERROR", message: fallback, status };
  }

  if (err instanceof Error) {
    return { code: "UNKNOWN_ERROR", message: err.message || fallback };
  }

  return { code: "UNKNOWN_ERROR", message: fallback };
}
