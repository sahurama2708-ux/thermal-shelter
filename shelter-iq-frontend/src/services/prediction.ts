import { api, unwrap } from "./api";
import type {
  PredictionRequestPayload,
  PredictionResult,
  RecommendationResult,
} from "../types/prediction";
import type { ApiEnvelope } from "../types/api";

export function predictThermalCondition(payload: PredictionRequestPayload): Promise<PredictionResult> {
  return unwrap(api.post<ApiEnvelope<PredictionResult>>("/api/v1/predictions/predict", payload));
}

export function recommendShelter(payload: PredictionRequestPayload): Promise<RecommendationResult> {
  return unwrap(api.post<ApiEnvelope<RecommendationResult>>("/api/v1/predictions/recommend", payload));
}
