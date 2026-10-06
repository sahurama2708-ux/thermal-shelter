interface HexaForgeBadgeProps {
  className?: string;
}

/** Small hex-mark used wherever HexaForge is credited, kept visually subordinate to the product logo. */
export default function HexaForgeBadge({ className = "" }: HexaForgeBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M12 8L15.5 10V14L12 16L8.5 14V10L12 8Z" fill="currentColor" opacity="0.5" />
      </svg>
      Built by <span className="font-semibold text-ink-600">HexaForge</span>
    </span>
  );
}
