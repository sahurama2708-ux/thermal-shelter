import { Thermometer, Droplets, Sun, Wind, Snowflake, Gauge } from "lucide-react";
import { getConditionMeta } from "../../utils/constants";
import { formatConfidence } from "../../utils/format";

const CONDITION_ICON: Record<string, typeof Thermometer> = {
  "Hot-Dry": Sun,
  "Hot-Humid": Droplets,
  Cold: Snowflake,
  "High-Solar": Sun,
  Windy: Wind,
  Moderate: Gauge,
};

interface ConditionBadgeProps {
  condition: string;
  confidence: number;
  size?: "md" | "lg";
}

export default function ConditionBadge({ condition, confidence, size = "lg" }: ConditionBadgeProps) {
  const meta = getConditionMeta(condition);
  const Icon = CONDITION_ICON[condition] ?? Thermometer;
  const big = size === "lg";

  return (
    <div className={`flex flex-col items-center text-center ${big ? "gap-4" : "gap-2.5"}`}>
      <div
        className={`relative flex items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-glow ${meta.gradient} ${
          big ? "h-24 w-24" : "h-14 w-14 rounded-2xl"
        }`}
      >
        <Icon className={big ? "h-11 w-11" : "h-6 w-6"} strokeWidth={1.75} />
      </div>
      <div>
        <p className={`font-display font-semibold text-ink-900 ${big ? "text-2xl" : "text-base"}`}>
          {meta.label}
        </p>
        <p className={`mt-1 font-medium ${meta.accent} ${big ? "text-sm" : "text-xs"}`}>
          {formatConfidence(confidence)} AI confidence
        </p>
      </div>
    </div>
  );
}
