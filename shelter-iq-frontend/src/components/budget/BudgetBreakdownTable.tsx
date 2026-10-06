import type { BudgetCategoryBreakdown } from "../../types/budget";
import { formatINR } from "../../utils/formatCurrency";

export default function BudgetBreakdownTable({ breakdown }: { breakdown: BudgetCategoryBreakdown[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-100/70">
      <table className="w-full text-sm">
        <thead className="bg-primary-50/60 text-left text-ink-600">
          <tr>
            <th className="px-4 py-2.5 font-medium">Category</th>
            <th className="px-4 py-2.5 text-right font-medium">Estimated Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-50">
          {breakdown.map((row) => (
            <tr
              key={row.category}
              className={row.category === "Total" ? "bg-primary-50/40 font-semibold text-ink-900" : "text-ink-700"}
            >
              <td className="px-4 py-2.5">{row.category}</td>
              <td className="px-4 py-2.5 text-right">{formatINR(row.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
