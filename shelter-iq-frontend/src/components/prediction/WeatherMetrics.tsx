import { Thermometer, Droplets, Wind, CloudRain, Sun } from "lucide-react";
import type { WeatherData } from "../../types/prediction";

interface Metric {
  key: keyof WeatherData;
  label: string;
  unit: string;
  icon: typeof Thermometer;
  format: (v: number) => string;
}

const METRICS: Metric[] = [
  { key: "T2M", label: "Temperature", unit: "°C", icon: Thermometer, format: (v) => v.toFixed(1) },
  { key: "RH2M", label: "Humidity", unit: "%", icon: Droplets, format: (v) => v.toFixed(0) },
  { key: "WS10M", label: "Wind Speed", unit: "m/s", icon: Wind, format: (v) => v.toFixed(1) },
  { key: "PRECTOTCORR", label: "Rainfall", unit: "mm/day", icon: CloudRain, format: (v) => v.toFixed(1) },
  { key: "ALLSKY_SFC_SW_DWN", label: "Solar Radiation", unit: "kWh/m²/day", icon: Sun, format: (v) => v.toFixed(1) },
];

export default function WeatherMetrics({ weather }: { weather: WeatherData }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {METRICS.map((metric) => {
        const value = weather[metric.key];
        if (value === undefined || value === null) return null;
        return (
          <div key={String(metric.key)} className="card flex flex-col gap-2 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <metric.icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-ink-900">
                {metric.format(value)}
                <span className="ml-1 text-xs font-normal text-ink-400">{metric.unit}</span>
              </p>
              <p className="text-xs text-ink-400">{metric.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
