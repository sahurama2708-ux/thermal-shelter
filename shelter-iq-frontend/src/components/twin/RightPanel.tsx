import { BatteryCharging, Gauge, Home, Sun, Thermometer, Users, Wind } from "lucide-react";
import { HOTSPOTS, type HotspotId } from "./shelterTwinData";

const ICONS: Record<HotspotId, typeof Sun> = {
  solar: Sun,
  battery: BatteryCharging,
  sensor: Thermometer,
  ventilation: Wind,
  occupancy: Users,
};

// MOCK — demo overview stats (see shelterTwinData.ts header for the mock/backend boundary).
const OVERVIEW_ROWS: Array<{ label: string; value: string }> = [
  { label: "Shelter Type", value: "Smart Modular Shelter" },
  { label: "Occupancy", value: "14 / 20" },
  { label: "Energy", value: "4.8 kW" },
  { label: "Battery", value: "78%" },
  { label: "Temperature", value: "27°C" },
  { label: "Air Quality", value: "Good" },
  { label: "Efficiency", value: "91%" },
];

type Props = {
  selected: HotspotId | null;
  onClear: () => void;
};

export default function RightPanel({ selected, onClear }: Props) {
  const active = HOTSPOTS.find((h) => h.id === selected) ?? null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
      {!active ? (
        <div className="animate-fade-up">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-semibold text-white">Shelter Overview</h3>
          </div>
          <div className="mt-4 space-y-2.5">
            {OVERVIEW_ROWS.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{row.label}</span>
                <span className="font-medium text-slate-100">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
            Click a hotspot on the model to inspect a component in detail.
          </p>
        </div>
      ) : (
        <div key={active.id} className="animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = ICONS[active.id];
                return <Icon className="h-4 w-4 text-cyan-300" />;
              })()}
              <h3 className="text-sm font-semibold text-white">{active.label}</h3>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-cyan-500/10 p-4">
            <p className="text-[11px] uppercase tracking-wide text-cyan-300/80">{active.metricLabel}</p>
            <p className="mt-1 text-2xl font-semibold text-cyan-100">{active.metricValue}</p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-400">{active.detail}</p>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[11px] text-slate-400">
            <Gauge className="h-3.5 w-3.5 text-emerald-300" />
            Live in the Optimization tab, adjusting related parameters updates this component on the model.
          </div>
        </div>
      )}
    </div>
  );
}
