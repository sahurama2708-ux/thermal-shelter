import type { BudgetEstimateRequestPayload, QualityTier, BudgetPriority } from "../../types/budget";
import { THERMAL_CONDITIONS } from "../../utils/constants";

interface BudgetFormProps {
  value: BudgetEstimateRequestPayload;
  onChange: (payload: BudgetEstimateRequestPayload) => void;
}

const QUALITY_OPTIONS: { value: QualityTier; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
];

const PRIORITY_OPTIONS: { value: BudgetPriority; label: string }[] = [
  { value: "cost", label: "Minimize cost" },
  { value: "balanced", label: "Balanced" },
  { value: "comfort", label: "Maximize comfort" },
];

export default function BudgetForm({ value, onChange }: BudgetFormProps) {
  const update = (patch: Partial<BudgetEstimateRequestPayload>) => onChange({ ...value, ...patch });

  return (
    <div className="card-3d space-y-5 p-6">
      <div>
        <label className="field-label" htmlFor="area_sqm">
          Built-up area (sq. m)
        </label>
        <input
          id="area_sqm"
          type="number"
          min={1}
          max={10000}
          step={1}
          className="field-input"
          value={value.area_sqm}
          onChange={(e) => update({ area_sqm: Number(e.target.value) || 0 })}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="thermal_condition">
          Thermal condition
        </label>
        <select
          id="thermal_condition"
          className="field-input"
          value={value.thermal_condition}
          onChange={(e) => update({ thermal_condition: e.target.value })}
        >
          {Object.keys(THERMAL_CONDITIONS).map((key) => (
            <option key={key} value={key}>
              {THERMAL_CONDITIONS[key].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="quality_tier">
            Quality tier
          </label>
          <select
            id="quality_tier"
            className="field-input"
            value={value.quality_tier}
            onChange={(e) => update({ quality_tier: e.target.value as QualityTier })}
          >
            {QUALITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            className="field-input"
            value={value.priority}
            onChange={(e) => update({ priority: e.target.value as BudgetPriority })}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium text-ink-600">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-ink-200 text-primary-600 focus:ring-primary-200"
          checked={value.hill_station === 1}
          onChange={(e) => update({ hill_station: e.target.checked ? 1 : 0 })}
        />
        Hill station / remote site (adds logistics cost)
      </label>

      <div>
        <label className="field-label" htmlFor="location_factor">
          Regional cost factor: {(value.location_factor ?? 1).toFixed(2)}x
        </label>
        <input
          id="location_factor"
          type="range"
          min={0.5}
          max={2}
          step={0.05}
          value={value.location_factor ?? 1}
          onChange={(e) => update({ location_factor: Number(e.target.value) })}
          className="w-full accent-primary-600"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="budget_limit">
          Your budget limit (₹, optional)
        </label>
        <input
          id="budget_limit"
          type="number"
          min={0}
          className="field-input"
          placeholder="e.g. 150000"
          value={value.budget_limit ?? ""}
          onChange={(e) => update({ budget_limit: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    </div>
  );
}
