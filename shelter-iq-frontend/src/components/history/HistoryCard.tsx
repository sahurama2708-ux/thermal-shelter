import { MapPin, Trash2, ChevronRight } from "lucide-react";
import type { PredictionHistoryItem } from "../../types/prediction";
import { getConditionMeta } from "../../utils/constants";
import { formatCoordinatePair, formatConfidence, formatDateTime, monthName } from "../../utils/format";

interface HistoryCardProps {
  item: PredictionHistoryItem;
  onOpen: (item: PredictionHistoryItem) => void;
  onDelete: (item: PredictionHistoryItem) => void;
}

export default function HistoryCard({ item, onOpen, onDelete }: HistoryCardProps) {
  const meta = getConditionMeta(item.thermal_condition);

  return (
    <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        onClick={() => onOpen(item)}
        className="flex flex-1 items-center gap-4 rounded-xl text-left"
      >
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${meta.soft}`}>
          {item.thermal_condition.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900">{meta.label}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
            <MapPin className="h-3 w-3 shrink-0" />
            {formatCoordinatePair(item.latitude, item.longitude)} · {monthName(item.month)}
            {item.hill_station === 1 ? " · Hill station" : ""}
          </p>
          <p className="mt-0.5 text-xs text-ink-400">{formatDateTime(item.created_at)}</p>
        </div>
      </button>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-right sm:mr-2">
          <p className="text-sm font-semibold text-ink-900">{formatConfidence(item.confidence)}</p>
          <p className="text-xs text-ink-400">Regime {item.climate_regime}</p>
        </div>
        <button
          onClick={() => onDelete(item)}
          className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"
          aria-label="Delete this analysis"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onOpen(item)}
          className="rounded-lg p-2 text-ink-400 hover:bg-primary-50 hover:text-primary-600"
          aria-label="View details"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
