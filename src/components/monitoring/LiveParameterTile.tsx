import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Brain, Compass } from 'lucide-react';
import { LiveMetricItem } from '../../types/engine';

interface LiveParameterTileProps {
  metric: LiveMetricItem;
  icon?: React.ElementType;
}

export const LiveParameterTile: React.FC<LiveParameterTileProps> = ({ metric, icon: Icon }) => {
  const isCritical = metric.status === 'CRITICAL';
  const isWarning = metric.status === 'WARNING';

  const TrendIcon =
    metric.trend === 'RISING'
      ? ArrowUpRight
      : metric.trend === 'FALLING'
      ? ArrowDownRight
      : ArrowRight;

  const trendColor =
    metric.trend === 'RISING' && (isCritical || isWarning)
      ? 'text-rose-400'
      : metric.trend === 'FALLING' && (isCritical || isWarning)
      ? 'text-amber-400'
      : 'text-slate-400';

  return (
    <div
      className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
        isCritical
          ? 'bg-[#18111e] border-rose-500/70 shadow-[0_0_18px_rgba(255,23,68,0.22)]'
          : isWarning
          ? 'bg-[#1a1714] border-amber-500/60 shadow-[0_0_14px_rgba(255,171,0,0.18)]'
          : 'bg-[#0d162a] border-[#1d2d4d] hover:border-[#2b416e]'
      }`}
    >
      {/* Top Header: Parameter Name, Category, Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          {Icon && (
            <div
              className={`p-1.5 rounded-md border ${
                isCritical
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-400'
                  : isWarning
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-400'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase">
              {metric.name}
            </h4>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 font-mono">
          {/* Trend Badge */}
          <span
            className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#101b33] border border-[#1b2b48] ${trendColor}`}
          >
            <TrendIcon className="w-3 h-3 mr-0.5" />
            <span>{metric.trend}</span>
          </span>

          {/* Status Badge */}
          <span
            className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded tracking-wider ${
              isCritical
                ? 'bg-rose-600 text-white animate-pulse'
                : isWarning
                ? 'bg-amber-600 text-black'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {metric.status}
          </span>
        </div>
      </div>

      {/* Primary Value: MEASURED / SIMULATED */}
      <div className="my-2 bg-[#09101f] p-2.5 rounded-lg border border-[#172540]">
        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-cyan-400 mb-0.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <strong>MEASURED / SIMULATED VALUE</strong>
          </span>
          <span className="text-slate-500">CAN 2.0B</span>
        </div>

        <div className="flex items-baseline justify-between font-mono">
          <span
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isCritical
                ? 'text-rose-400'
                : isWarning
                ? 'text-amber-400'
                : 'text-slate-100'
            }`}
          >
            {metric.measured}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {metric.unit}
          </span>
        </div>
      </div>

      {/* Comparison Grid: EXPECTED vs AI ESTIMATE */}
      <div className="grid grid-cols-2 gap-2 font-mono text-[10px] mb-2">
        {/* EXPECTED VALUE */}
        <div className="bg-[#0e172a] p-2 rounded border border-[#1a2845]">
          <span className="text-[8px] uppercase tracking-wider text-slate-400 block">
            EXPECTED VALUE
          </span>
          <span className="text-slate-200 font-bold text-xs mt-0.5 block">
            {metric.expected} {metric.unit}
          </span>
          <span className="text-[9px] text-slate-500 block">Nominal Physics</span>
        </div>

        {/* AI ESTIMATE */}
        <div className="bg-[#0e172a] p-2 rounded border border-[#1a2845]">
          <span className="text-[8px] uppercase tracking-wider text-purple-300 flex items-center gap-1">
            <Brain className="w-2.5 h-2.5 text-purple-400" />
            <span>AI ESTIMATE</span>
          </span>
          <span className="text-purple-200 font-bold text-xs mt-0.5 block">
            {metric.aiEstimate} {metric.unit}
          </span>
          <span
            className={`text-[9px] font-bold block ${
              metric.delta.startsWith('+') && isCritical
                ? 'text-rose-400'
                : metric.delta.startsWith('-') && isCritical
                ? 'text-amber-400'
                : 'text-cyan-300'
            }`}
          >
            Δ: {metric.delta}
          </span>
        </div>
      </div>

      {/* Footer: Expected Operating Range */}
      <div className="pt-2 border-t border-[#182643] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="text-slate-500">Expected Operating Range:</span>
        <span className="text-slate-300 font-semibold">{metric.expectedRange}</span>
      </div>
    </div>
  );
};
