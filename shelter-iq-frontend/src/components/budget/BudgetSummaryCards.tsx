import AnimatedNumber from "../common/AnimatedNumber";
import { formatINR } from "../../utils/formatCurrency";

interface BudgetSummaryCardsProps {
  estimated: number;
  recommended: number;
  minimum: number;
  maximum: number;
}

const CARDS = [
  { key: "estimated", label: "Estimated Budget", accent: "text-primary-700" },
  { key: "recommended", label: "Recommended Budget", accent: "text-emerald-700" },
  { key: "minimum", label: "Minimum Budget", accent: "text-ink-600" },
  { key: "maximum", label: "Maximum / Comfortable", accent: "text-amber-700" },
] as const;

export default function BudgetSummaryCards({ estimated, recommended, minimum, maximum }: BudgetSummaryCardsProps) {
  const values: Record<string, number> = { estimated, recommended, minimum, maximum };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div key={card.key} className="card-3d p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{card.label}</p>
          <p className={`mt-2 font-display text-2xl font-semibold ${card.accent}`}>
            <AnimatedNumber value={values[card.key]} formatter={formatINR} />
          </p>
        </div>
      ))}
    </div>
  );
}
