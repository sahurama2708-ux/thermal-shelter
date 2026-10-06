interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Geometric shelter + AI-node mark: a gabled roofline over a base, with a
 * single node picking out the roof apex to gesture at "AI reads the climate
 * at the point where the structure meets the sky."
 */
export default function Logo({ size = 34, showWordmark = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#2563EB" />
        <path
          d="M9 21L20 11L31 21"
          stroke="white"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 21V29.5H26.5V21"
          stroke="white"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="17.5" r="2.1" fill="white" />
      </svg>
      {showWordmark && (
        <span className="font-display text-[17px] font-semibold leading-none tracking-tight text-ink-900">
          Thermal Shelter
        </span>
      )}
    </div>
  );
}
