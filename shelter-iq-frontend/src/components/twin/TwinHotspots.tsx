import { BatteryCharging, Sun, Thermometer, Users, Wind, X } from "lucide-react";
import { HOTSPOTS, type HotspotId } from "./shelterTwinData";

const ICONS: Record<HotspotId, typeof Sun> = {
  solar: Sun,
  battery: BatteryCharging,
  sensor: Thermometer,
  ventilation: Wind,
  occupancy: Users,
};

type Props = {
  selected: HotspotId | null;
  onSelect: (id: HotspotId | null) => void;
};

/**
 * Flat 2D overlay of hotspot dots positioned at fixed percentages tuned
 * against the model's default "overview" camera angle. This keeps hit-testing
 * simple (no real 3D-to-screen projection math needed) while still reading as
 * "click a part of the shelter to inspect it".
 */
export default function TwinHotspots({ selected, onSelect }: Props) {
  const active = HOTSPOTS.find((h) => h.id === selected) ?? null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {HOTSPOTS.map((spot) => {
        const Icon = ICONS[spot.id];
        const isActive = selected === spot.id;
        return (
          <button
            key={spot.id}
            type="button"
            className="pointer-events-auto absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
            style={{ left: `${spot.xPct}%`, top: `${spot.yPct}%` }}
            onClick={() => onSelect(isActive ? null : spot.id)}
            aria-pressed={isActive}
            aria-label={spot.label}
          >
            <span
              className={`absolute h-8 w-8 rounded-full ${isActive ? "animate-ping" : "twin-pulse-ring"}`}
              style={{ background: isActive ? "rgba(56,189,248,0.35)" : "rgba(56,189,248,0.18)" }}
            />
            <span
              className={`relative flex h-6 w-6 items-center justify-center rounded-full border text-cyan-100 backdrop-blur-sm ${
                isActive ? "border-cyan-300 bg-cyan-500/40 shadow-[0_0_16px_rgba(56,189,248,0.8)]" : "border-cyan-400/50 bg-slate-900/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          </button>
        );
      })}

      {active && (
        <div
          className="pointer-events-auto absolute w-56 -translate-x-1/2 animate-fade-up rounded-xl border border-cyan-400/30 bg-slate-950/90 p-3.5 shadow-[0_20px_50px_-20px_rgba(56,189,248,0.5)] backdrop-blur-xl"
          style={{
            left: `${active.xPct}%`,
            top: `calc(${active.yPct}% + 26px)`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-100">{active.label}</p>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="rounded p-0.5 text-slate-400 hover:text-slate-100"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-cyan-300/80">{active.metricLabel}</p>
          <p className="text-lg font-semibold text-cyan-100">{active.metricValue}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{active.detail}</p>
        </div>
      )}
    </div>
  );
}
