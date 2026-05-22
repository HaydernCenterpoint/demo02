import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trendText: string;
  isPositive: boolean; // green vs red/yellow
  sparklineColor: string; // Tailwind stroke color e.g., 'stroke-blue-500' or hex for stroke
  gradientId: string;
  gradientFrom: string;
  gradientTo: string;
  historyData: number[]; // e.g. [10, 15, 8, 22, 19, 25...]
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trendText,
  isPositive,
  sparklineColor,
  gradientId,
  gradientFrom,
  gradientTo,
  historyData,
}) => {
  // Simple responsive SVG sparkline path math
  const width = 160;
  const height = 44;
  const max = Math.max(...historyData) * 1.15 || 100;
  const min = Math.min(...historyData) * 0.85 || 0;
  const range = max - min;

  const points = historyData.map((val, index) => {
    const x = (index / (historyData.length - 1)) * width;
    const y = height - ((val - min) / (range || 1)) * (height - 8) - 4;
    return { x, y };
  });

  // Generate cubic bezier curve for smoothness
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  // Create closed path for the filled area gradient
  const filledPathD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : '';

  return (
    <div
      className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 transition-all duration-200 shadow-lg shadow-slate-950/20 relative overflow-hidden group flex flex-col justify-between"
      style={{ contentVisibility: 'auto' }}
    >
      {/* Background radial soft light overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-900/10 pointer-events-none" />

      <div>
        {/* Title */}
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5 truncate">
          {title}
        </h3>

        {/* Primary reading */}
        <div className="flex items-baseline mb-2">
          <span className="text-2xl font-bold tracking-tight text-white select-all">
            {value}
          </span>
        </div>

        {/* Comparison Trend with colorful arrows */}
        <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-[#f59e0b]'}`}>
          {isPositive ? (
            <ArrowUp className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          )}
          <span>{trendText}</span>
        </div>
      </div>

      {/* Sparkline visualization at bottom of card */}
      <div className="mt-4 -mx-5 -mb-5 h-11 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.4} />
              <stop offset="100%" stopColor={gradientTo} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <path d={filledPathD} fill={`url(#${gradientId})`} className="transition-all duration-300" />
          <path
            d={pathD}
            fill="none"
            stroke={sparklineColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      </div>
    </div>
  );
};
