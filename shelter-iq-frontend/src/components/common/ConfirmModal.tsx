import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import Spinner from "./Spinner";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        tabIndex={-1}
        className="w-full max-w-sm animate-fade-up rounded-2xl bg-white p-6 shadow-glow outline-none"
      >
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${
            destructive ? "bg-rose-50 text-rose-600" : "bg-primary-50 text-primary-600"
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-ink-900">
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={
              destructive
                ? "inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                : "btn-primary"
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Spinner />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
