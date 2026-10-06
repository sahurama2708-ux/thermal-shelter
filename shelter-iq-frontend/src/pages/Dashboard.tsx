import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Thermometer, Gauge, Layers, History as HistoryIcon, Sparkles, Wallet, ArrowRight, Boxes } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import RecentAnalysisRow from "../components/dashboard/RecentAnalysisRow";
import EmptyState from "../components/common/EmptyState";
import PageSpinner from "../components/common/PageSpinner";
import { useAuth } from "../context/AuthContext";
import { getHistory } from "../services/history";
import type { PredictionHistoryItem } from "../types/prediction";
import { getConditionMeta } from "../utils/constants";
import { formatConfidence } from "../utils/format";
import { normalizeError } from "../utils/errors";

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<PredictionHistoryItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getHistory(1, 5)
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        if (!active) return;
        setError(normalizeError(err, "Couldn't load your recent analyses.").message);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const latest = items?.[0];
  const latestMeta = latest ? getConditionMeta(latest.thermal_condition) : null;
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-ink-400">Let's design a shelter adapted to its environment.</p>
        </div>
        <Link to="/predict" className="btn-primary">
          <Plus className="h-4 w-4" /> New Climate Analysis
        </Link>
      </div>

      {loading ? (
        <div className="mt-10">
          <PageSpinner label="Loading your dashboard..." />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Thermometer}
              label="Latest thermal condition"
              value={latestMeta?.label ?? "—"}
              hint={latest ? undefined : "Run your first analysis"}
            />
            <StatCard
              icon={Layers}
              label="Climate regime"
              value={latest ? `Cluster ${latest.climate_regime}` : "—"}
            />
            <StatCard
              icon={Gauge}
              label="AI confidence"
              value={latest ? formatConfidence(latest.confidence) : "—"}
            />
            <StatCard icon={HistoryIcon} label="Total analyses" value={String(total)} accent="neutral" />
          </div>

          <Link
            to="/budget"
            className="card-3d mt-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink-900">Budget Suggestion</h2>
                <p className="text-sm text-ink-400">
                  Get a transparent construction budget estimate for your shelter design.
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary-600">
              Estimate now <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            to="/twin"
            className="card-3d relative mt-6 flex flex-col items-start justify-between gap-4 overflow-hidden bg-slate-950 p-6 text-white sm:flex-row sm:items-center"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.35),transparent_55%)]" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                <Boxes className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-white">Digital Twin</h2>
                <p className="text-sm text-slate-400">
                  Explore the interactive 3D Shelter IQ digital twin, AI optimization, and analytics.
                </p>
              </div>
            </div>
            <span className="relative flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-cyan-300">
              Open 3D view <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <div className="mt-8 card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">Recent analyses</h2>
              {items && items.length > 0 && (
                <Link to="/history" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              )}
            </div>

            <div className="mt-4">
              {error && <p className="text-sm text-rose-600">{error}</p>}

              {!error && items && items.length === 0 && (
                <EmptyState
                  icon={Sparkles}
                  title="No analyses yet."
                  description="Run your first climate analysis to see thermal conditions and shelter recommendations here."
                  actionLabel="Run your first analysis"
                  actionTo="/predict"
                />
              )}

              {!error && items && items.length > 0 && (
                <div className="divide-y divide-primary-50">
                  {items.map((item) => (
                    <RecentAnalysisRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
