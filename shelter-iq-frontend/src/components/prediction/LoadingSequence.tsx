import { useEffect, useState } from "react";
import { CloudSun, BrainCircuit, Home, Check } from "lucide-react";

const STAGES = [
  { label: "Fetching climate data...", icon: CloudSun },
  { label: "Running AI analysis...", icon: BrainCircuit },
  { label: "Generating shelter recommendation...", icon: Home },
];

/** Cycles through stage copy while the real request is in flight; it doesn't know true progress, just paces itself against typical request timing. */
export default function LoadingSequence() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStageIndex(1), 1400),
      window.setTimeout(() => setStageIndex(2), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-10 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary-400" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow">
          {(() => {
            const Icon = STAGES[stageIndex].icon;
            return <Icon className="h-7 w-7" />;
          })()}
        </div>
      </div>

      <p className="mt-6 font-display text-lg font-semibold text-ink-900">{STAGES[stageIndex].label}</p>
      <p className="mt-1 text-sm text-ink-400">This usually takes a few seconds.</p>

      <div className="mt-6 flex items-center gap-2">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                i < stageIndex
                  ? "bg-emerald-100 text-emerald-600"
                  : i === stageIndex
                    ? "bg-primary-600 text-white"
                    : "bg-primary-50 text-primary-300"
              }`}
            >
              {i < stageIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            {i < STAGES.length - 1 && <span className="h-px w-6 bg-primary-100" />}
          </div>
        ))}
      </div>
    </div>
  );
}
