/**
 * Every backend response is wrapped in this envelope (see app/utils/responses.py).
 * Success: { success: true, data: T }
 * Failure: { success: false, error: { code, message } }
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorBody;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

/** Normalized error shape used throughout the app after unwrapping axios errors. */
export interface AppError {
  code: string;
  message: string;
  status?: number;
}
