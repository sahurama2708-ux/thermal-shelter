import { useState } from "react";
import { CheckCircle2, Loader2, Sparkles, TrendingUp } from "lucide-react";
import AnimatedNumber from "../common/AnimatedNumber";
import { formatINR } from "../../utils/formatCurrency";
import { AI_OPTIMIZATION_MOCK, type ShelterParams } from "./shelterTwinData";

type Props = {
  onApply: (params: Partial<ShelterParams>) => void;
  optimizing: boolean;
  setOptimizing: (v: boolean) => void;
};

/**
 * MOCK — there is no AI-optimization endpoint on the backend yet (only
 * /predictions/recommend and /budget/estimate exist). This panel simulates
 * the run with a short delay, then applies clearly-labeled demo deltas onto
 * the live 3D model via onApply so the effect is visible, not just numeric.
 */
export default function AIOptimizationPanel({ onApply, optimizing, setOptimizing }: Props) {
  const [applied, setApplied] = useState(false);

  const runOptimization = () => {
    setApplied(false);
    setOptimizing(true);
    window.setTimeout(() => {
      const deltas: Partial<ShelterParams> = {};
      for (const rec of AI_OPTIMIZATION_MOCK.recommendations) {
        deltas[rec.param] = rec.delta;
      }
      onApply(deltas);
      setOptimizing(false);
      setApplied(true);
    }, 1800);
  };

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-950/70 to-slate-950/70 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-cyan-300" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-200">AI Optimization</h3>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Design Score" value={AI_OPTIMIZATION_MOCK.designScore} suffix="/100" />
        <Stat label="Potential Improvement" value={AI_OPTIMIZATION_MOCK.potentialImprovement} suffix="%" prefix="+" accent />
        <Stat label="Est. Energy Saving" value={AI_OPTIMIZATION_MOCK.energySaving} suffix="%" />
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-[11px] text-slate-400">Est. Cost Saving</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">
            {formatINR(AI_OPTIMIZATION_MOCK.costSaving)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={runOptimization}
        disabled={optimizing}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.45)] transition-transform duration-200 hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {optimizing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Optimizing shelter design…
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4" /> Run AI Optimization
          </>
        )}
      </button>

      {applied && (
        <div className="mt-4 animate-fade-up space-y-1.5">
          {AI_OPTIMIZATION_MOCK.recommendations.map((rec) => (
            <div key={rec.label} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              {rec.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  prefix = "",
  accent = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ? "text-cyan-300" : "text-slate-100"}`}>
        {prefix}
        <AnimatedNumber value={value} />
        {suffix}
      </p>
    </div>
  );
}
