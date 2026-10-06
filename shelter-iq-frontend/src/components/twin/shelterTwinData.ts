/**
 * Shelter IQ digital-twin data.
 *
 * IMPORTANT — mock/demo data boundary:
 * The Thermal Shelter backend (see src/services/prediction.ts and
 * src/services/budget.ts) only exposes climate prediction + shelter design
 * recommendations and construction budget estimates. It does not expose
 * live telemetry (energy generation, battery %, occupancy sensors, AI
 * design-optimization scores) or a design-parameter API.
 *
 * Everything in this file is therefore clearly isolated DEMO data for the
 * interactive digital-twin visualization only. It is intentionally kept in
 * one file, named and commented as MOCK, so it can be swapped for a real
 * endpoint later without touching any component internals — just change
 * what feeds ShelterTwinPage's state.
 */

export type HotspotId = "solar" | "battery" | "sensor" | "ventilation" | "occupancy";

export type ShelterParams = {
  orientation: number; // 0-360 deg, rotates the shelter body relative to the sun path
  roofAngle: number; // 0-30 deg
  solarArea: number; // 10-100 %
  ventilation: number; // 0-100 %
  material: number; // 0-100 (lighter material score)
  insulation: number; // 0-100
  batteryCapacity: number; // 10-100 %
  occupancy: number; // 0-20 people
};

export const DEFAULT_SHELTER_PARAMS: ShelterParams = {
  orientation: 0,
  roofAngle: 15,
  solarArea: 70,
  ventilation: 75,
  material: 60,
  insulation: 65,
  batteryCapacity: 60,
  occupancy: 14,
};

export type CameraPresetId = "overview" | "front" | "side" | "top" | "interior";

export const CAMERA_PRESETS: Record<
  CameraPresetId,
  { rotX: number; rotY: number; zoom: number; panX: number; panY: number; label: string }
> = {
  overview: { rotX: 18, rotY: -35, zoom: 1, panX: 0, panY: 0, label: "Overview" },
  front: { rotX: 6, rotY: 0, zoom: 1.15, panX: 0, panY: 0, label: "Front" },
  side: { rotX: 6, rotY: 88, zoom: 1.1, panX: 0, panY: 0, label: "Side" },
  top: { rotX: 72, rotY: -20, zoom: 1.05, panX: 0, panY: 0, label: "Top" },
  interior: { rotX: 4, rotY: 6, zoom: 1.85, panX: 0, panY: -18, label: "Interior" },
};

export type HotspotDef = {
  id: HotspotId;
  label: string;
  xPct: number; // overlay position, tuned against the default "overview" camera preset
  yPct: number;
  metricLabel: string;
  metricValue: string;
  detail: string;
};

// MOCK — demo telemetry values shown on hotspot cards (see file header).
export const HOTSPOTS: HotspotDef[] = [
  {
    id: "solar",
    label: "Solar Panel Array",
    xPct: 64,
    yPct: 42,
    metricLabel: "Energy Generation",
    metricValue: "4.8 kW",
    detail: "Roof-mounted array tuned to the current pitch. Output scales with roof angle and panel area.",
  },
  {
    id: "battery",
    label: "Battery Storage",
    xPct: 80,
    yPct: 58,
    metricLabel: "Storage",
    metricValue: "78%",
    detail: "Buffer pack sized to cover overnight loads and peak occupancy draw.",
  },
  {
    id: "sensor",
    label: "Temperature Sensor",
    xPct: 45,
    yPct: 24,
    metricLabel: "Ambient Temperature",
    metricValue: "27°C",
    detail: "Mast-mounted node feeding the thermal comfort model in real time.",
  },
  {
    id: "ventilation",
    label: "Ventilation",
    xPct: 55,
    yPct: 48,
    metricLabel: "Efficiency",
    metricValue: "92%",
    detail: "Passive louvered vents tuned for cross-ventilation with the local wind rose.",
  },
  {
    id: "occupancy",
    label: "Occupancy",
    xPct: 44,
    yPct: 66,
    metricLabel: "Current Occupancy",
    metricValue: "14 / 20",
    detail: "Modeled seating and circulation space for up to 20 occupants.",
  },
];

export type OptimizationRecommendation = {
  label: string;
  param: keyof ShelterParams;
  delta: number;
};

// MOCK — a real "AI Optimization" endpoint does not exist on the backend yet.
export const AI_OPTIMIZATION_MOCK: {
  designScore: number;
  potentialImprovement: number;
  energySaving: number;
  costSaving: number;
  recommendations: OptimizationRecommendation[];
} = {
  designScore: 91,
  potentialImprovement: 12,
  energySaving: 18,
  costSaving: 42000,
  recommendations: [
    { label: "Increase solar panel angle by 8°", param: "roofAngle", delta: 8 },
    { label: "Improve natural ventilation", param: "ventilation", delta: 15 },
    { label: "Reduce material usage by 6%", param: "material", delta: -6 },
    { label: "Increase battery capacity", param: "batteryCapacity", delta: 15 },
    { label: "Optimize shelter orientation", param: "orientation", delta: 35 },
  ],
};

// MOCK — 7-point demo trend series for the analytics charts.
export const ANALYTICS_MOCK = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  energyConsumption: [3.2, 3.5, 3.1, 3.8, 4.0, 3.6, 3.4],
  solarGeneration: [4.0, 4.4, 3.9, 4.8, 5.1, 4.6, 4.2],
  temperature: [24, 25, 27, 29, 28, 26, 25],
  occupancy: [10, 12, 14, 16, 14, 11, 9],
  airQuality: [92, 90, 88, 91, 93, 89, 90],
  optimizationScore: [78, 80, 83, 86, 88, 90, 91],
  costIndex: [48, 46, 45, 44, 43, 42, 42],
};

export function clampParam(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const PARAM_LIMITS: Record<keyof ShelterParams, { min: number; max: number; step: number; unit: string }> = {
  orientation: { min: 0, max: 360, step: 1, unit: "°" },
  roofAngle: { min: 0, max: 30, step: 1, unit: "°" },
  solarArea: { min: 10, max: 100, step: 1, unit: "%" },
  ventilation: { min: 0, max: 100, step: 1, unit: "%" },
  material: { min: 0, max: 100, step: 1, unit: "%" },
  insulation: { min: 0, max: 100, step: 1, unit: "%" },
  batteryCapacity: { min: 10, max: 100, step: 1, unit: "%" },
  occupancy: { min: 0, max: 20, step: 1, unit: "" },
};
