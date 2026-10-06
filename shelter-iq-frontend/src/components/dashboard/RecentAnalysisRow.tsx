import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { PredictionHistoryItem } from "../../types/prediction";
import { getConditionMeta } from "../../utils/constants";
import { formatCoordinatePair, formatConfidence, formatDate, monthName } from "../../utils/format";

export default function RecentAnalysisRow({ item }: { item: PredictionHistoryItem }) {
  const meta = getConditionMeta(item.thermal_condition);

  return (
    <Link
      to="/history"
      className="group flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-primary-100 hover:bg-primary-50/50"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold ${meta.soft}`}>
          {item.thermal_condition.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{meta.label}</p>
          <p className="flex items-center gap-1 truncate text-xs text-ink-400">
            <MapPin className="h-3 w-3 shrink-0" />
            {formatCoordinatePair(item.latitude, item.longitude)} · {monthName(item.month)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-right">
        <div>
          <p className="text-sm font-semibold text-ink-900">{formatConfidence(item.confidence)}</p>
          <p className="text-xs text-ink-400">{formatDate(item.created_at)}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-ink-200 transition-colors group-hover:text-primary-600" />
      </div>
    </Link>
  );
}
