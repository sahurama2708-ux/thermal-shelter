export type ThermalCondition =
  | "Hot-Dry"
  | "Hot-Humid"
  | "Cold"
  | "High-Solar"
  | "Windy"
  | "Moderate"
  | string;

export interface PredictionRequestPayload {
  latitude: number;
  longitude: number;
  month: number;
  hill_station: 0 | 1;
}

export interface PredictionResult {
  thermal_condition: ThermalCondition;
  confidence: number;
  climate_regime: number;
}

export interface ShelterDesign {
  roof: string;
  walls: string;
  ventilation: string;
  shading: string;
  priority: string;
}

export interface RecommendationResult extends PredictionResult {
  design: ShelterDesign;
}

export interface WeatherData {
  T2M: number;
  RH2M: number;
  WS10M: number;
  PRECTOTCORR: number;
  ALLSKY_SFC_SW_DWN: number;
  [key: string]: number;
}

export interface PredictionHistoryItem {
  id: string;
  latitude: number;
  longitude: number;
  month: number;
  hill_station: 0 | 1;
  thermal_condition: ThermalCondition;
  confidence: number;
  climate_regime: number;
  weather_data: WeatherData;
  design: ShelterDesign;
  created_at: string;
}

export interface PaginatedHistory {
  items: PredictionHistoryItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
