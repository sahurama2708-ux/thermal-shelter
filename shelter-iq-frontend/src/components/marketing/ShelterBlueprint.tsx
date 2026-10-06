/**
 * Abstract line-drawing of a gabled shelter over a blueprint grid, with a
 * data pulse travelling from a location pin down through the roofline —
 * visualizing Location -> Climate Data -> AI Prediction -> Shelter Recommendation
 * without literal icons for each step (those live in the floating cards instead).
 */
export default function ShelterBlueprint() {
  return (
    <svg viewBox="0 0 520 420" fill="none" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* blueprint grid */}
      <g opacity="0.35">
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="420" stroke="#2563EB" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="520" y2={i * 40} stroke="#2563EB" strokeWidth="0.5" />
        ))}
      </g>

      {/* ground line */}
      <line x1="60" y1="330" x2="460" y2="330" stroke="#93C5FD" strokeWidth="2" strokeDasharray="2 6" />

      {/* location pin descending pulse */}
      <circle cx="260" cy="60" r="46" fill="url(#pulseGlow)" />
      <path
        d="M260 40C270 40 278 48 278 58C278 70 260 88 260 88C260 88 242 70 242 58C242 48 250 40 260 40Z"
        fill="#2563EB"
      />
      <circle cx="260" cy="57" r="5" fill="white" />
      <line x1="260" y1="88" x2="260" y2="150" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 5">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.4s" repeatCount="indefinite" />
      </line>

      {/* roofline */}
      <path
        d="M110 210L260 110L410 210"
        stroke="url(#roofGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* walls */}
      <path
        d="M140 210V300H380V210"
        stroke="#1E3A8A"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* door */}
      <rect x="240" y="250" width="40" height="50" rx="3" stroke="#2563EB" strokeWidth="3" fill="white" />
      {/* windows */}
      <rect x="170" y="235" width="34" height="30" rx="3" stroke="#93C5FD" strokeWidth="3" fill="#EFF6FF" />
      <rect x="316" y="235" width="34" height="30" rx="3" stroke="#93C5FD" strokeWidth="3" fill="#EFF6FF" />

      {/* shading overhang */}
      <path d="M120 208L260 106L400 208" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="1 6" opacity="0.9" />

      {/* apex sensor node echoing the logo mark */}
      <circle cx="260" cy="110" r="7" fill="#2563EB" />
      <circle cx="260" cy="110" r="7" fill="none" stroke="#2563EB" strokeWidth="1.5">
        <animate attributeName="r" values="7;22;7" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
