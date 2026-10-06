import { useCallback, useEffect, useState } from "react";
import { History as HistoryIcon } from "lucide-react";
import HistoryCard from "../components/history/HistoryCard";
import HistoryDetailPanel from "../components/history/HistoryDetailPanel";
import Pagination from "../components/common/Pagination";
import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";
import ErrorBanner from "../components/common/ErrorBanner";
import PageSpinner from "../components/common/PageSpinner";
import { deleteHistoryItem, getHistory } from "../services/history";
import type { PredictionHistoryItem } from "../types/prediction";
import { normalizeError } from "../utils/errors";
import { useToast } from "../context/ToastContext";

const PAGE_SIZE = 10;

export default function History() {
  const { showToast } = useToast();
  const [items, setItems] = useState<PredictionHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<PredictionHistoryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PredictionHistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback((targetPage: number) => {
    setLoading(true);
    setError(null);
    getHistory(targetPage, PAGE_SIZE)
      .then((res) => {
        setItems(res.items);
        setTotalPages(res.total_pages);
        setPage(res.page);
      })
      .catch((err) => setError(normalizeError(err, "Couldn't load your climate analyses.").message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteHistoryItem(pendingDelete.id);
      showToast("Prediction deleted", "success");
      setPendingDelete(null);
      const remainingOnPage = items.length - 1;
      const nextPage = remainingOnPage === 0 && page > 1 ? page - 1 : page;
      load(nextPage);
    } catch (err) {
      showToast(normalizeError(err, "Couldn't delete this analysis.").message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Your Climate Analyses</h1>
      <p className="mt-1 text-sm text-ink-400">Every location and month you've analyzed, saved for reference.</p>

      <div className="mt-8">
        {loading && <PageSpinner label="Loading history..." />}

        {!loading && error && <ErrorBanner message={error} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon={HistoryIcon}
            title="No climate analyses yet."
            description="Once you run an analysis, it'll show up here with its full thermal condition and design breakdown."
            actionLabel="Analyze Your First Location"
            actionTo="/predict"
          />
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onOpen={setSelected}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
            <div className="mt-6">
              <Pagination page={page} totalPages={totalPages} onChange={load} />
            </div>
          </>
        )}
      </div>

      <HistoryDetailPanel item={selected} onClose={() => setSelected(null)} />

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete this analysis?"
        description="This will permanently remove this climate analysis and its shelter recommendation from your history."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
