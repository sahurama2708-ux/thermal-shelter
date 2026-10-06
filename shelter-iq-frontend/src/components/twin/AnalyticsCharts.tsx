import { ANALYTICS_MOCK } from "./shelterTwinData";

/**
 * Lightweight themed SVG charts — no charting library dependency required.
 * All series here are MOCK demo trend data (see shelterTwinData.ts header).
 */

function Sparkline({ data, color, unit = "" }: { data: number[]; color: string; unit?: string }) {
  const w = 240;
  const h = 64;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });
  const path = `M${points.join(" L")}`;
  const areaPath = `${path} L${w},${h} L0,${h} Z`;
  const gradientId = `grad-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * (h - 8) - 4} r={3} fill={color} />
    </svg>
  );
}

function DonutStat({ label, value, color }: { label: string; value: number; color: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 76 76" className="h-20 w-20">
        <circle cx={38} cy={38} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
        <circle
          cx={38}
          cy={38}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 38 38)"
        />
        <text x={38} y={43} textAnchor="middle" className="fill-white text-[15px] font-semibold">
          {value}
        </text>
      </svg>
      <p className="mt-1 text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

const CARDS: Array<{ title: string; key: keyof typeof ANALYTICS_MOCK; color: string; unit: string }> = [
  { title: "Energy Consumption", key: "energyConsumption", color: "#f59e0b", unit: "kW" },
  { title: "Solar Generation", key: "solarGeneration", color: "#22d3ee", unit: "kW" },
  { title: "Temperature", key: "temperature", color: "#fb7185", unit: "°C" },
  { title: "Occupancy", key: "occupancy", color: "#a78bfa", unit: "people" },
  { title: "Cost Index", key: "costIndex", color: "#34d399", unit: "" },
];

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {CARDS.map((card) => {
        const series = ANALYTICS_MOCK[card.key] as number[];
        const latest = series[series.length - 1];
        return (
          <div key={card.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400">{card.title}</p>
              <p className="text-sm font-semibold text-slate-100">
                {latest}
                {card.unit ? ` ${card.unit}` : ""}
              </p>
            </div>
            <div className="mt-2">
              <Sparkline data={series} color={card.color} />
            </div>
          </div>
        );
      })}

      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl">
        <p className="text-xs font-medium text-slate-400">Air Quality &amp; Optimization Score</p>
        <div className="mt-3 flex items-center justify-around">
          <DonutStat label="Air Quality" value={ANALYTICS_MOCK.airQuality[ANALYTICS_MOCK.airQuality.length - 1]} color="#38bdf8" />
          <DonutStat
            label="Optimization Score"
            value={ANALYTICS_MOCK.optimizationScore[ANALYTICS_MOCK.optimizationScore.length - 1]}
            color="#4ade80"
          />
        </div>
      </div>
    </div>
  );
}
