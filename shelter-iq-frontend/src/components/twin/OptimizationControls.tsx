import { PARAM_LIMITS, type ShelterParams } from "./shelterTwinData";

const LABELS: Record<keyof ShelterParams, string> = {
  orientation: "Orientation",
  roofAngle: "Roof Angle",
  solarArea: "Solar Panel Area",
  ventilation: "Ventilation",
  material: "Material",
  insulation: "Insulation",
  batteryCapacity: "Battery Capacity",
  occupancy: "Occupancy",
};

const ORDER: Array<keyof ShelterParams> = [
  "orientation",
  "roofAngle",
  "solarArea",
  "ventilation",
  "material",
  "insulation",
  "batteryCapacity",
  "occupancy",
];

type Props = {
  params: ShelterParams;
  onChange: (key: keyof ShelterParams, value: number) => void;
  onReset: () => void;
};

export default function OptimizationControls({ params, onChange, onReset }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Design Parameters</h3>
        <button type="button" onClick={onReset} className="text-[11px] font-medium text-cyan-300 hover:text-cyan-200">
          Reset
        </button>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        Demo controls — update the model instantly. Not yet wired to a design-parameter API.
      </p>

      <div className="mt-4 space-y-4">
        {ORDER.map((key) => {
          const limit = PARAM_LIMITS[key];
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">{LABELS[key]}</span>
                <span className="font-mono text-cyan-300">
                  {params[key]}
                  {limit.unit}
                </span>
              </div>
              <input
                type="range"
                min={limit.min}
                max={limit.max}
                step={limit.step}
                value={params[key]}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className="twin-slider w-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
