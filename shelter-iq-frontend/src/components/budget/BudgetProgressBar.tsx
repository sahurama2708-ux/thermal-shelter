interface BudgetProgressBarProps {
  percent: number;
  colorClass?: string;
  label?: string;
}

export default function BudgetProgressBar({ percent, colorClass = "bg-primary-600", label }: BudgetProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-sm text-ink-600">
          <span>{label}</span>
          <span className="font-semibold text-ink-900">{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-primary-50">
        <div
          className={`h-full rounded-full ${colorClass} transition-[width] duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
