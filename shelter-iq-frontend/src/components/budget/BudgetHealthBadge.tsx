import type { BudgetHealth } from "../../types/budget";

const HEALTH_META: Record<BudgetHealth, { label: string; className: string }> = {
  comfortable: { label: "Comfortable", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  adequate: { label: "Adequate", className: "bg-primary-50 text-primary-700 border-primary-200" },
  tight: { label: "Tight", className: "bg-amber-50 text-amber-700 border-amber-200" },
  insufficient: { label: "Insufficient", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function BudgetHealthBadge({ health }: { health: BudgetHealth }) {
  const meta = HEALTH_META[health];
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
