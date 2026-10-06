import { useRef, useState } from "react";
import { Maximize2, Move, RotateCw } from "lucide-react";
import ShelterModel3D, { type ShelterModel3DHandle } from "../components/twin/ShelterModel3D";
import TwinHotspots from "../components/twin/TwinHotspots";
import { TwinMobileTabs, TwinSidebar, TwinTopBar, type TwinSection } from "../components/twin/TwinChrome";
import RightPanel from "../components/twin/RightPanel";
import AIOptimizationPanel from "../components/twin/AIOptimizationPanel";
import OptimizationControls from "../components/twin/OptimizationControls";
import AnalyticsCharts from "../components/twin/AnalyticsCharts";
import {
  clampParam,
  DEFAULT_SHELTER_PARAMS,
  PARAM_LIMITS,
  type CameraPresetId,
  type HotspotId,
  type ShelterParams,
} from "../components/twin/shelterTwinData";

const PRESET_ORDER: Array<{ id: CameraPresetId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "top", label: "Top" },
  { id: "interior", label: "Interior" },
];

export default function Twin() {
  const [section, setSection] = useState<TwinSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState<HotspotId | null>(null);
  const [params, setParams] = useState<ShelterParams>(DEFAULT_SHELTER_PARAMS);
  const [optimizing, setOptimizing] = useState(false);
  const modelRef = useRef<ShelterModel3DHandle>(null);

  const updateParam = (key: keyof ShelterParams, value: number) => {
    const limit = PARAM_LIMITS[key];
    setParams((prev) => ({ ...prev, [key]: clampParam(value, limit.min, limit.max) }));
  };

  const applyOptimization = (deltas: Partial<ShelterParams>) => {
    setParams((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(deltas) as Array<keyof ShelterParams>) {
        const limit = PARAM_LIMITS[key];
        const delta = deltas[key] ?? 0;
        next[key] = clampParam(prev[key] + delta, limit.min, limit.max);
      }
      return next;
    });
  };

  const showDesignSurface = section === "dashboard" || section === "design" || section === "optimization";

  return (
    <div className="min-h-screen bg-[#05070d] bg-[radial-gradient(circle_at_15%_-10%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_100%_20%,rgba(99,102,241,0.12),transparent_40%)] p-3 text-slate-100 sm:p-4">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3">
        <TwinTopBar section={section} />
        <TwinMobileTabs section={section} onSelect={setSection} />

        <div className="flex flex-1 items-stretch gap-3">
          <TwinSidebar section={section} onSelect={setSection} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

          <main className="flex min-w-0 flex-1 flex-col gap-3">
            {showDesignSurface && (
              <div className="grid flex-1 grid-cols-1 gap-3 xl:grid-cols-[1fr_320px]">
                <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl sm:min-h-[560px]">
                  <ShelterModel3D ref={modelRef} params={params} selected={selected} optimizing={optimizing} className="h-full" />
                  <TwinHotspots selected={selected} onSelect={setSelected} />

                  <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-md">
                    <Move className="h-3.5 w-3.5 text-cyan-300" />
                    Drag to rotate · Right-drag to pan · Scroll to zoom
                  </div>

                  <div className="pointer-events-auto absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                    {PRESET_ORDER.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => modelRef.current?.flyTo(preset.id)}
                        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[11px] font-medium text-slate-300 backdrop-blur-md transition-colors hover:border-cyan-400/40 hover:text-cyan-200"
                      >
                        <Maximize2 className="h-3 w-3" /> {preset.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => modelRef.current?.flyTo("overview")}
                    className="pointer-events-auto absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[11px] font-medium text-slate-300 backdrop-blur-md hover:border-cyan-400/40 hover:text-cyan-200"
                  >
                    <RotateCw className="h-3 w-3" /> Reset view
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <RightPanel selected={selected} onClear={() => setSelected(null)} />
                  {section === "dashboard" && (
                    <AIOptimizationPanel onApply={applyOptimization} optimizing={optimizing} setOptimizing={setOptimizing} />
                  )}
                  {section === "optimization" && (
                    <OptimizationControls
                      params={params}
                      onChange={updateParam}
                      onReset={() => setParams(DEFAULT_SHELTER_PARAMS)}
                    />
                  )}
                </div>
              </div>
            )}

            {section === "analytics" && (
              <div className="flex-1 rounded-2xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-xl sm:p-5">
                <h2 className="text-sm font-semibold text-white">Analytics</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Demo trend data — not yet backed by a live telemetry endpoint.
                </p>
                <div className="mt-4">
                  <AnalyticsCharts />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
