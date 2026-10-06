import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";

export default function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="flex h-4 w-4 items-center justify-center rounded-full text-ink-400 hover:text-primary-600"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={text}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg bg-ink-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
        >
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink-900" />
        </span>
      )}
    </span>
  );
}

export function InlineHint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-ink-400">{children}</p>;
}
