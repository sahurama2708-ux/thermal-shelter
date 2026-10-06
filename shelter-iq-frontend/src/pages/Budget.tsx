import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { estimateBudget } from "../services/budget";
import type { BudgetEstimateRequestPayload, BudgetEstimateResult } from "../types/budget";
import BudgetForm from "../components/budget/BudgetForm";
import BudgetSummaryCards from "../components/budget/BudgetSummaryCards";
import BudgetDonutChart from "../components/budget/BudgetDonutChart";
import BudgetProgressBar from "../components/budget/BudgetProgressBar";
import BudgetBreakdownTable from "../components/budget/BudgetBreakdownTable";
import BudgetHealthBadge from "../components/budget/BudgetHealthBadge";
import ErrorBanner from "../components/common/ErrorBanner";
import Spinner from "../components/common/Spinner";
import { formatINR } from "../utils/formatCurrency";
import { normalizeError } from "../utils/errors";

const SEGMENT_COLORS = ["#2563EB", "#0EA5E9", "#F59E0B", "#10B981", "#F43F5E"];

interface LocationState {
  thermal_condition?: string;
  hill_station?: 0 | 1;
}

export default function Budget() {
  const location = useLocation();
  const seed = (location.state as LocationState) || {};

  const [payload, setPayload] = useState<BudgetEstimateRequestPayload>({
    area_sqm: 40,
    thermal_condition: seed.thermal_condition || "Moderate",
    hill_station: seed.hill_station ?? 0,
    quality_tier: "standard",
    priority: "balanced",
    location_factor: 1,
    budget_limit: null,
  });

  const [result, setResult] = useState<BudgetEstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const timeout = setTimeout(async () => {
      try {
        const data = await estimateBudget(payload);
        if (active) setResult(data);
      } catch (err) {
        if (active) setError(normalizeError(err, "Couldn't calculate a budget estimate.").message);
      } finally {
        if (active) setLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [payload]);

  const donutSegments = useMemo(() => {
    if (!result) return [];
    return result.breakdown
      .filter((row) => row.category !== "Total")
      .map((row, i) => ({ label: row.category, value: row.amount, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }));
  }, [result]);

  const utilizationPct = result?.utilization_pct ?? null;
  const hasBudgetLimit = payload.budget_limit != null && payload.budget_limit > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Budget Suggestion</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-ink-600">
          A transparent construction budget for your shelter, calculated from your inputs — materials,
          implementation, operation, maintenance and contingency. Change any input to instantly recalculate.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <BudgetForm value={payload} onChange={setPayload} />

        <div className="space-y-6">
          {error && <ErrorBanner message={error} />}

          {loading && !result && (
            <div className="card-3d flex items-center justify-center p-12">
              <Spinner className="h-6 w-6 text-primary-600" />
            </div>
          )}

          {result && (
            <div className="animate-fade-up space-y-6">
              <BudgetSummaryCards
                estimated={result.estimated_budget}
                recommended={result.recommended_budget}
                minimum={result.minimum_budget}
                maximum={result.maximum_budget}
              />

              <div className="card-3d grid grid-cols-1 gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="mx-auto">
                  <BudgetDonutChart segments={donutSegments} />
                </div>
                <div className="space-y-3">
                  {donutSegments.map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-ink-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                        {segment.label}
                      </span>
                      <span className="font-medium text-ink-900">{formatINR(segment.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {hasBudgetLimit && (
                <div className="card-3d space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-ink-900">Budget Health</h3>
                    {result.health && <BudgetHealthBadge health={result.health} />}
                  </div>
                  <BudgetProgressBar
                    percent={utilizationPct ?? 0}
                    label={`${formatINR(payload.budget_limit ?? 0)} / ${formatINR(result.recommended_budget)} recommended`}
                  />
                </div>
              )}

              <div>
                <h3 className="mb-3 font-display text-base font-semibold text-ink-900">Cost Breakdown</h3>
                <BudgetBreakdownTable breakdown={result.breakdown} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
