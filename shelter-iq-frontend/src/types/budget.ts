export type QualityTier = "economy" | "standard" | "premium";
export type BudgetPriority = "cost" | "balanced" | "comfort";
export type BudgetHealth = "comfortable" | "adequate" | "tight" | "insufficient";

export interface BudgetEstimateRequestPayload {
  area_sqm: number;
  thermal_condition?: string;
  hill_station?: 0 | 1;
  quality_tier?: QualityTier;
  priority?: BudgetPriority;
  location_factor?: number;
  budget_limit?: number | null;
}

export interface BudgetCategoryBreakdown {
  category: string;
  amount: number;
}

export interface BudgetEstimateResult {
  currency: string;
  estimated_budget: number;
  recommended_budget: number;
  minimum_budget: number;
  maximum_budget: number;
  breakdown: BudgetCategoryBreakdown[];
  budget_limit?: number | null;
  utilization_pct?: number | null;
  health?: BudgetHealth | null;
  assumptions: Record<string, unknown>;
}
