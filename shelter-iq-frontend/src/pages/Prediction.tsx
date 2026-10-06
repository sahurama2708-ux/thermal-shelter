import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { LocateFixed, Sparkles, RotateCcw, Wallet } from "lucide-react";
import ErrorBanner from "../components/common/ErrorBanner";
import Tooltip from "../components/common/Tooltip";
import LoadingSequence from "../components/prediction/LoadingSequence";
import ConditionBadge from "../components/prediction/ConditionBadge";
import WeatherMetrics from "../components/prediction/WeatherMetrics";
import ShelterDesignCard from "../components/prediction/ShelterDesignCard";
import { useGeolocation } from "../hooks/useGeolocation";
import { recommendShelter } from "../services/prediction";
import { normalizeError } from "../utils/errors";
import { MONTHS } from "../utils/constants";
import { getConditionMeta } from "../utils/constants";
import type { RecommendationResult } from "../types/prediction";

const currentMonthIndex = new Date().getMonth() + 1;

export default function Prediction() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [month, setMonth] = useState(currentMonthIndex);
  const [hillStation, setHillStation] = useState<0 | 1>(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const { loading: geoLoading, error: geoError, locate } = useGeolocation();

  const useMyLocation = () => {
    locate((lat, lon) => {
      setLatitude(lat.toFixed(4));
      setLongitude(lon.toFixed(4));
    });
  };

  const validate = (): string | null => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) return "Enter a valid latitude between -90 and 90.";
    if (Number.isNaN(lon) || lon < -180 || lon > 180) return "Enter a valid longitude between -180 and 180.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setResult(null);
    try {
      const data = await recommendShelter({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        month,
        hill_station: hillStation,
      });
      setResult(data);
    } catch (err) {
      setError(normalizeError(err, "Couldn't complete the analysis. Please try again.").message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Analyze Your Climate</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
          Enter a location and month to get an AI-predicted thermal condition and shelter recommendation.
        </p>
      </div>

      <div className="mt-8 card p-6 sm:p-8">
        {submitting ? (
          <LoadingSequence />
        ) : result ? (
          <ResultView result={result} hillStation={hillStation} onReset={resetForm} />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {error && <ErrorBanner message={error} />}

            <div className="flex items-center justify-between rounded-xl bg-primary-50/60 px-4 py-3">
              <p className="text-sm text-ink-600">Let the browser fill in your coordinates.</p>
              <button
                type="button"
                onClick={useMyLocation}
                className="btn-secondary !px-3.5 !py-2 text-xs"
                disabled={geoLoading}
              >
                <LocateFixed className="h-3.5 w-3.5" />
                {geoLoading ? "Locating..." : "Use my location"}
              </button>
            </div>
            {geoError && <p className="text-xs text-rose-600">{geoError}</p>}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="latitude" className="field-label">
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 26.4499"
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="field-label">
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 80.3319"
                  className="field-input"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="month" className="field-label">
                  Month
                </label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="field-input"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <label className="field-label !mb-0">Hill station</label>
                  <Tooltip text="Select Yes for locations such as hill towns where elevation significantly affects shelter design." />
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHillStation(0)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                      hillStation === 0
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-ink-200 text-ink-600 hover:bg-ink-900/[0.02]"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setHillStation(1)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                      hillStation === 1
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-ink-200 text-ink-600 hover:bg-ink-900/[0.02]"
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              <Sparkles className="h-4 w-4" /> Analyze Climate
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ResultView({
  result,
  hillStation,
  onReset,
}: {
  result: RecommendationResult;
  hillStation: 0 | 1;
  onReset: () => void;
}) {
  const meta = getConditionMeta(result.thermal_condition);

  return (
    <div className="animate-fade-up space-y-8">
      <div className={`rounded-2xl border p-8 ${meta.soft}`}>
        <ConditionBadge condition={result.thermal_condition} confidence={result.confidence} />
        <p className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-ink-600">
          {meta.description}
        </p>
        <p className="mt-3 text-center text-xs text-ink-400">Climate regime cluster: {result.climate_regime}</p>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Shelter Recommendation
        </h2>
        <ShelterDesignCard design={result.design} />
      </section>

      <div className="flex flex-col gap-3 border-t border-primary-100 pt-6 sm:flex-row sm:justify-between">
        <button onClick={onReset} className="btn-secondary">
          <RotateCcw className="h-4 w-4" /> Analyze another location
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/budget"
            state={{ thermal_condition: result.thermal_condition, hill_station: hillStation }}
            className="btn-secondary"
          >
            <Wallet className="h-4 w-4" /> Estimate budget
          </Link>
          <Link to="/history" className="btn-primary">
            View in history
          </Link>
        </div>
      </div>
    </div>
  );
}
