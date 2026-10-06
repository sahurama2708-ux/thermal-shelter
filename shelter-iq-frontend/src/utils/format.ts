import { MONTHS } from "./constants";

export function monthName(month: number): string {
  return MONTHS[month - 1] ?? `Month ${month}`;
}

export function formatCoordinate(value: number): string {
  return value.toFixed(3);
}

export function formatCoordinatePair(lat: number, lon: number): string {
  const latLabel = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
  const lonLabel = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
  return `${latLabel}, ${lonLabel}`;
}

export function formatConfidence(confidence: number): string {
  // Backend already rounds to 2dp; values may arrive as 0-1 or 0-100 depending
  // on model output, so normalize defensively before display.
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  return `${pct.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function initials(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
