import { useCallback, useState } from "react";

interface GeoState {
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ loading: false, error: null });

  const locate = useCallback((onSuccess: (lat: number, lon: number) => void) => {
    if (!("geolocation" in navigator)) {
      setState({ loading: false, error: "Geolocation isn't supported in this browser." });
      return;
    }

    setState({ loading: true, error: null });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({ loading: false, error: null });
        onSuccess(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Enter coordinates manually instead."
            : "Couldn't determine your location. Enter coordinates manually instead.";
        setState({ loading: false, error: message });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...state, locate };
}
