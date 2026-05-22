import React, { useState } from 'react';
import { Language, TranslationSchema, DefectItem, TaskStatusItem, FaultyDeviceItem } from '../types';
import { translations } from '../translations';
import { ChevronDown, BarChart2, Award, PieChart, CheckSquare } from 'lucide-react';

interface ChartsSectionProps {
  currentLanguage: Language;
  hourlyData: { time: string; value: number; target: number }[];
  faultyDevices: FaultyDeviceItem[];
  commonErrors: DefectItem[];
  taskStatuses: TaskStatusItem[];
  totalErrors: number;
  totalTasks: number;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  currentLanguage,
  hourlyData,
  faultyDevices,
  commonErrors,
  taskStatuses,
  totalErrors,
  totalTasks,
}) => {
  const t: TranslationSchema = translations[currentLanguage];

  // Hover states for the line chart tooltip
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Hover states for Donut Categories
  const [hoveredErrorIndex, setHoveredErrorIndex] = useState<number | null>(null);
  const [hoveredTaskIndex, setHoveredTaskIndex] = useState<number | null>(null);

  // Dimensions for Hourly Performance SVG
  const width = 450;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const chartValToY = (val: number) => {
    return height - paddingY - (val / 100) * (height - 2 * paddingY);
  };

  const chartIndexToX = (idx: number) => {
    return paddingX + (idx / (hourlyData.length - 1)) * (width - 2 * paddingX);
  };

  // Generate cubic bezier curve path for performance values
  let performancePath = '';
  const points = hourlyData.map((d, i) => ({ x: chartIndexToX(i), y: chartValToY(d.value) }));
  if (points.length > 0) {
    performancePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      performancePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  // Filled gradient path underneath
  const filledPerformancePath = points.length > 0
    ? `${performancePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  // Constant target level Y position (75%)
  const targetY = chartValToY(75);

  // Helper to render segment paths for Donut charts
  const renderDonutSegments = <T extends { percentage: number; color: string }>(
    data: T[],
    radius: number,
    strokeWidth: number,
    hoveredIdx: number | null,
    setHoveredIdx: (idx: number | null) => void
  ) => {
    const circumference = 2 * Math.PI * radius; // 2 * PI * 35 = 219.9
    let accumulatedPercent = 0;

    return data.map((item, idx) => {
      const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
      const rotation = (accumulatedPercent / 100) * 360 - 90;
      accumulatedPercent += item.percentage;

      const isHovered = hoveredIdx === idx;

      return (
        <circle
          key={idx}
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={item.color}
          strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(${rotation} 50 50)`}
          strokeLinecap="round"
          className="cursor-pointer hover:opacity-100"
          style={{
            opacity: hoveredIdx !== null && !isHovered ? 0.35 : 0.9,
            transition: 'opacity 0.2s ease, stroke-width 0.2s ease',
          }}
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        />
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="charts-main-grid">
      {/* 1. HIỆU SUẤT THEO GIỜ (Hourly Performance) - 40% span in desktop or half */}
      <div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between lg:col-span-1.5" id="hourly-performance-card">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
              <BarChart2 className="w-4.5 h-4.5 text-blue-500" />
              {t.hourlyPerformance}
            </h3>
            {/* Today Dropdown */}
            <button className="flex items-center space-x-1 py-1 px-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80 rounded-md cursor-pointer transition-all">
              <span>{t.today}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Line Chart Container with dynamic interaction on hover */}
          <div
            className="w-full relative select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" id="hourly-svg-canvas">
              {/* Grid Y Guidelines */}
              {[0, 25, 50, 75, 100].map((gridVal) => {
                const y = chartValToY(gridVal);
                return (
                  <g key={gridVal}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {gridVal}
                    </text>
                  </g>
                );
              })}

              {/* Base Line X-axis */}
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#334155" strokeWidth="1" />

              {/* Area Shading beneath performance path */}
              <defs>
                <linearGradient id="performance-chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <path d={filledPerformancePath} fill="url(#performance-chart-grad)" />

              {/* Target Standard Line (Green dash) */}
              <line
                x1={paddingX}
                y1={targetY}
                x2={width - paddingX}
                y2={targetY}
                stroke="#10b981"
                strokeWidth="1.25"
                strokeDasharray="4 2"
              />

              {/* Core Performance Wavy Line */}
              <path d={performancePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

              {/* interactive Vertical Tracker Line on Hover */}
              {hoveredIndex !== null && (
                <line
                  x1={chartIndexToX(hoveredIndex)}
                  y1={paddingY}
                  x2={chartIndexToX(hoveredIndex)}
                  y2={height - paddingY}
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* Dots for values and invisible interactive hover panes */}
              {hourlyData.map((d, idx) => {
                const cx = chartIndexToX(idx);
                const cy = chartValToY(d.value);
                const isItemHovered = hoveredIndex === idx;

                return (
                  <g key={idx}>
                    {/* Glowing highlight circle around active node */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isItemHovered ? 6 : 3.5}
                      fill={isItemHovered ? '#3b82f6' : '#1d4ed8'}
                      stroke={isItemHovered ? '#ffffff' : '#3b82f6'}
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />

                    {/* Invisible hover capture column */}
                    <rect
                      x={cx - 20}
                      y={paddingY}
                      width="40"
                      height={height - 2 * paddingY}
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => setHoveredIndex(idx)}
                    />
                  </g>
                );
              })}

              {/* X-Axis labels */}
              {hourlyData.map((d, idx) => (
                <text
                  key={idx}
                  x={chartIndexToX(idx)}
                  y={height - 8}
                  fill="#64748b"
                  fontSize="9.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {d.time}
                </text>
              ))}
            </svg>

            {/* Custom Glowing Tooltip overlay box driven by react state */}
            {hoveredIndex !== null && (
              <div
                className="absolute bg-[#0b0f19] border border-slate-700/80 rounded-lg p-2 md:p-3 shadow-xl z-20 pointer-events-none text-xs text-slate-200"
                style={{
                  left: `${Math.min(
                    Math.max((hoveredIndex / (hourlyData.length - 1)) * 100 - 15, 5),
                    70
                  )}%`,
                  top: '10px',
                }}
              >
                <div className="font-semibold text-[11px] text-slate-400 mb-1 leading-none">
                  {hourlyData[hoveredIndex].time}
                </div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>
                    {t.performancePercent}: <strong className="text-white font-bold">{hourlyData[hoveredIndex].value}%</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 leading-tight">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {t.targetPercent}: <span className="text-slate-300">75%</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend of line chart at bottom of card */}
        <div className="flex items-center justify-start space-x-4 border-t border-slate-800/40 pt-3 text-[10px] md:text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
            <span className="text-slate-400 font-medium">{t.performancePercent}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-emerald-500 inline-block"></span>
            <span className="text-slate-400 font-medium">{t.targetPercent}</span>
          </div>
        </div>
      </div>

      {/* 2. TOP THIẾT BỊ LỖI NHIỀU NHẤT (Top Faulty Devices) */}
      <div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col min-h-[220px]" id="top-faulty-devices-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-blue-500" />
            {t.topFaultyDevices}
          </h3>
          <span className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors" id="top-faulty-view-all">
            {t.viewAll}
          </span>
        </div>

        <div className="flex-grow flex items-center justify-center">
          {/* List layout */}
          <div className="space-y-2.5 w-full">
            {faultyDevices.map((item, idx) => (
              <div
                key={idx}
                id={`faulty-device-rank-${item.rank}`}
                className="flex items-center justify-between bg-slate-900/40 border border-slate-800/40 rounded-lg p-2 hover:bg-slate-900/80 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Rank Badge */}
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-400 text-xs font-mono font-bold flex-shrink-0">
                    {item.rank}
                  </span>
                  {/* Device Name Translated */}
                  <span className="text-xs text-slate-300 font-medium truncate">
                    {t[item.nameKey] ? (t[item.nameKey] as string) : item.nameKey}
                  </span>
                </div>

                {/* Alarm count pill */}
                <span className="py-0.5 px-2.5 text-xs font-bold font-mono text-white bg-red-600/90 rounded-full flex-shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TOP LỖI PHỔ BIẾN (Top Common Errors / Donut Chart 1) */}
      <div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col min-h-[220px]" id="common-errors-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
            <PieChart className="w-4.5 h-4.5 text-blue-500" />
            {t.topCommonErrors}
          </h3>
          <span className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors" id="common-errors-view-all">
            {t.viewAll}
          </span>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="grid grid-cols-12 gap-5 items-center w-full">
            {/* Donut Arc Circle Representation */}
            <div className="col-span-5 flex items-center justify-center relative">
              <svg viewBox="0 0 100 100" className="w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] md:w-[130px] md:h-[130px] overflow-visible drop-shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                {/* Clean dark grey background guide ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="12" />

                {/* Draw sequential stacked pie sectors with SVG stroke offsets */}
                {renderDonutSegments(commonErrors, 38, 12, hoveredErrorIndex, setHoveredErrorIndex)}
              </svg>

              {/* Total errors center counter */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-white font-mono leading-none tracking-tight">
                  {totalErrors}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5">
                  {t.totalErrorsLabel.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Right side list Legend */}
            <div className="col-span-7 space-y-1.5 overflow-hidden select-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {commonErrors.map((item, idx) => {
                const isHovered = hoveredErrorIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? 'bg-slate-800/50 border-slate-700/40 shadow-md scale-[1.02]'
                        : 'bg-transparent border-transparent hover:bg-slate-800/20'
                    }`}
                    onMouseEnter={() => setHoveredErrorIndex(idx)}
                    onMouseLeave={() => setHoveredErrorIndex(null)}
                  >
                    <div className="flex items-center min-w-0 mr-2">
                      {/* Color indicator block with glow */}
                      <span
                        className="w-2 h-2 rounded-full mr-2.5 flex-shrink-0 transition-transform duration-200"
                        style={{
                          backgroundColor: item.color,
                          boxShadow: isHovered ? `0 0 8px ${item.color}` : 'none',
                          transform: isHovered ? 'scale(1.2)' : 'none',
                        }}
                      />
                      <span className={`truncate text-[11px] font-medium transition-colors ${
                        isHovered ? 'text-white' : 'text-slate-300'
                      }`}>
                        {t[item.nameKey] ? (t[item.nameKey] as string) : item.nameKey}
                      </span>
                    </div>
                    {/* Monospace value column */}
                    <span className={`font-mono text-xs font-bold transition-colors ${
                      isHovered ? 'text-blue-400' : 'text-slate-400'
                    }`}>
                      {item.percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. NHIỆM VỤ THEO TRẠNG THÁI (Tasks by Status / Donut Chart 2) */}
      <div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col min-h-[220px]" id="tasks-status-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
            <CheckSquare className="w-4.5 h-4.5 text-blue-500" />
            {t.tasksByStatus}
          </h3>
          <span className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors" id="tasks-status-view-all">
            {t.viewAll}
          </span>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="grid grid-cols-12 gap-5 items-center w-full">
            {/* Donut Arc Circle Representation */}
            <div className="col-span-5 flex items-center justify-center relative">
              <svg viewBox="0 0 100 100" className="w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] md:w-[130px] md:h-[130px] overflow-visible drop-shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                {/* Clean dark grey background ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="12" />

                {/* Draw segments */}
                {renderDonutSegments(taskStatuses, 38, 12, hoveredTaskIndex, setHoveredTaskIndex)}
              </svg>

              {/* Total tasks center counter */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-white font-mono leading-none tracking-tight">
                  {totalTasks}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5 text-center px-1">
                  {t.taskTotalLabel}
                </span>
              </div>
            </div>

            {/* Right side list Legend */}
            <div className="col-span-7 space-y-1.5 overflow-hidden select-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {taskStatuses.map((item, idx) => {
                const isHovered = hoveredTaskIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? 'bg-slate-800/50 border-slate-700/40 shadow-md scale-[1.02]'
                        : 'bg-transparent border-transparent hover:bg-slate-800/20'
                    }`}
                    onMouseEnter={() => setHoveredTaskIndex(idx)}
                    onMouseLeave={() => setHoveredTaskIndex(null)}
                  >
                    <div className="flex items-center min-w-0 mr-2">
                      {/* Color indicator block with glow */}
                      <span
                        className="w-2 h-2 rounded-full mr-2.5 flex-shrink-0 transition-transform duration-200"
                        style={{
                          backgroundColor: item.color,
                          boxShadow: isHovered ? `0 0 8px ${item.color}` : 'none',
                          transform: isHovered ? 'scale(1.2)' : 'none',
                        }}
                      />
                      <span className={`truncate text-[11px] font-medium transition-colors ${
                        isHovered ? 'text-white' : 'text-slate-300'
                      }`}>
                        {t[item.nameKey] ? (t[item.nameKey] as string) : item.nameKey}
                      </span>
                    </div>
                    {/* Monospace value column */}
                    <span className={`font-mono text-xs font-bold transition-colors ${
                      isHovered ? 'text-blue-400' : 'text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
