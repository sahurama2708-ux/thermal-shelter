interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface BudgetDonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}

/**
 * Lightweight, dependency-free animated donut chart built from stacked SVG
 * circle strokes. No charting library needed - keeps the bundle small.
 */
export default function BudgetDonutChart({ segments, size = 180, strokeWidth = 22 }: BudgetDonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label="Budget breakdown chart">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EFF6FF" strokeWidth={strokeWidth} />
      {segments.map((segment) => {
        const fraction = segment.value / total;
        const dash = Math.max(0, fraction * circumference - 1.5);
        const gap = circumference - dash;
        const rotation = (offsetAcc / total) * 360;
        offsetAcc += segment.value;
        return (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "50% 50%",
              transition: "stroke-dasharray 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        );
      })}
    </svg>
  );
}
