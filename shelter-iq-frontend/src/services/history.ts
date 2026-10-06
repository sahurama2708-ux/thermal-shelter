import { api, unwrap } from "./api";
import type { PaginatedHistory, PredictionHistoryItem } from "../types/prediction";
import type { ApiEnvelope } from "../types/api";

export function getHistory(page: number, pageSize: number): Promise<PaginatedHistory> {
  return unwrap(
    api.get<ApiEnvelope<PaginatedHistory>>("/api/v1/predictions/history", {
      params: { page, page_size: pageSize },
    })
  );
}

export function getHistoryItem(id: string): Promise<PredictionHistoryItem> {
  return unwrap(api.get<ApiEnvelope<PredictionHistoryItem>>(`/api/v1/predictions/history/${id}`));
}

export function deleteHistoryItem(id: string): Promise<void> {
  return api.delete(`/api/v1/predictions/history/${id}`).then(() => undefined);
}
