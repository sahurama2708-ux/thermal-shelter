import { X } from "lucide-react";
import type { PredictionHistoryItem } from "../../types/prediction";
import ConditionBadge from "../prediction/ConditionBadge";
import WeatherMetrics from "../prediction/WeatherMetrics";
import ShelterDesignCard from "../prediction/ShelterDesignCard";
import { formatCoordinatePair, formatDateTime, monthName } from "../../utils/format";

export default function HistoryDetailPanel({
  item,
  onClose,
}: {
  item: PredictionHistoryItem | null;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xl animate-fade-up flex-col overflow-y-auto bg-surface-sky shadow-glow">
        <div className="flex items-center justify-between border-b border-primary-100 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-medium text-ink-400">
              {formatCoordinatePair(item.latitude, item.longitude)} · {monthName(item.month)}
            </p>
            <p className="text-xs text-ink-400">{formatDateTime(item.created_at)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-ink-600 hover:bg-primary-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-8 px-6 py-8">
          <ConditionBadge condition={item.thermal_condition} confidence={item.confidence} />

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Weather Data</h3>
            <WeatherMetrics weather={item.weather_data} />
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">
              Shelter Recommendation
            </h3>
            <ShelterDesignCard design={item.design} />
          </section>

          <p className="text-xs text-ink-400">Climate regime cluster: {item.climate_regime}</p>
        </div>
      </div>
    </div>
  );
}
