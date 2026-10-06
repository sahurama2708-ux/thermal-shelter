export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const STORAGE_KEYS = {
  accessToken: "thermal_shelter_access_token",
  refreshToken: "thermal_shelter_refresh_token",
} as const;

export interface ThermalConditionMeta {
  label: string;
  description: string;
  gradient: string;
  accent: string;
  soft: string;
}

/**
 * Presentation metadata for each thermal_condition value the backend can
 * return (see app/services/recommender.py for the canonical label set).
 * Purely cosmetic — no scientific claims beyond what the backend provides.
 */
export const THERMAL_CONDITIONS: Record<string, ThermalConditionMeta> = {
  "Hot-Dry": {
    label: "Hot & Dry",
    description:
      "Intense daytime heat with low humidity and wide day-night temperature swings.",
    gradient: "from-amber-400 to-primary-600",
    accent: "text-amber-600",
    soft: "bg-amber-50 border-amber-200",
  },
  "Hot-Humid": {
    label: "Hot & Humid",
    description:
      "High temperature paired with high moisture in the air, limiting natural cooling.",
    gradient: "from-teal-400 to-primary-600",
    accent: "text-teal-600",
    soft: "bg-teal-50 border-teal-200",
  },
  Cold: {
    label: "Cold",
    description:
      "Low temperatures where retaining heat matters more than shedding it.",
    gradient: "from-sky-400 to-primary-700",
    accent: "text-sky-700",
    soft: "bg-sky-50 border-sky-200",
  },
  "High-Solar": {
    label: "High Solar Exposure",
    description:
      "Strong solar radiation drives heat gain, even where air temperature is moderate.",
    gradient: "from-orange-400 to-primary-600",
    accent: "text-orange-600",
    soft: "bg-orange-50 border-orange-200",
  },
  Windy: {
    label: "Windy",
    description:
      "Persistent wind speeds that shape ventilation and structural bracing needs.",
    gradient: "from-cyan-400 to-primary-600",
    accent: "text-cyan-600",
    soft: "bg-cyan-50 border-cyan-200",
  },
  Moderate: {
    label: "Moderate",
    description:
      "A balanced climate without a single dominant stress on comfort.",
    gradient: "from-primary-400 to-primary-600",
    accent: "text-primary-600",
    soft: "bg-primary-50 border-primary-200",
  },
};

export const getConditionMeta = (condition: string): ThermalConditionMeta =>
  THERMAL_CONDITIONS[condition] ?? {
    label: condition,
    description: "AI-predicted thermal condition for this location and month.",
    gradient: "from-primary-400 to-primary-600",
    accent: "text-primary-600",
    soft: "bg-primary-50 border-primary-200",
  };
