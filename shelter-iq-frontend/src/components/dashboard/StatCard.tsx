import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: "primary" | "neutral";
}

export default function StatCard({ icon: Icon, label, value, hint, accent = "primary" }: StatCardProps) {
  return (
    <div className="card p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          accent === "primary" ? "bg-primary-50 text-primary-600" : "bg-ink-900/5 text-ink-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
