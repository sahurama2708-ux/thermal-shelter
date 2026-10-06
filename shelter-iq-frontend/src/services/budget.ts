import { api, unwrap } from "./api";
import type { ApiEnvelope } from "../types/api";
import type { BudgetEstimateRequestPayload, BudgetEstimateResult } from "../types/budget";

export function estimateBudget(payload: BudgetEstimateRequestPayload): Promise<BudgetEstimateResult> {
  return unwrap(api.post<ApiEnvelope<BudgetEstimateResult>>("/api/v1/budget/estimate", payload));
}
