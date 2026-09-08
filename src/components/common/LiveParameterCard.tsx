export interface ParameterConfig {
  key: string;
  name: string;
  value: number | string;
  unit: string;
  normalRange: string;
  minLimit: number;
  maxLimit: number;
  currentNum: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  icon: React.ElementType;
}

interface LiveParameterCardProps {
  param: ParameterConfig;
}

export const LiveParameterCard: React.FC<LiveParameterCardProps> = ({ param }) => {
  const isCritical = param.status === 'CRITICAL';
  const isWarning = param.status === 'WARNING';

  // Calculate percentage in range meter
  const span = param.maxLimit - param.minLimit;
  const percentage = Math.max(0, Math.min(100, ((param.currentNum - param.minLimit) / span) * 100));

  const Icon = param.icon;

  return (
    <div
      className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
        isCritical
          ? 'bg-[#17111c] border-rose-500/70 shadow-[0_0_15px_rgba(255,23,68,0.2)]'
          : isWarning
          ? 'bg-[#181615] border-amber-500/60 shadow-[0_0_12px_rgba(255,171,0,0.15)]'
          : 'bg-[#0d162a] border-[#1d2d4d] hover:border-[#2a3f6a]'
      }`}
    >
      {/* Top row: Name & Status badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isCritical
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                : isWarning
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                : 'bg-cyan-950/50 border-cyan-500/30 text-cyan-400'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
            {param.name}
          </span>
        </div>

        <span
          className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded tracking-wider ${
            isCritical
              ? 'bg-rose-600/90 text-white animate-pulse'
              : isWarning
              ? 'bg-amber-600/90 text-black'
              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {param.status}
        </span>
      </div>

      {/* Middle row: Big Value & Unit */}
      <div className="my-1.5 flex items-baseline justify-between font-mono">
        <span
          className={`text-2xl lg:text-3xl font-black tracking-tight ${
            isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-100'
          }`}
        >
          {param.value}
        </span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {param.unit}
        </span>
      </div>

      {/* Visual Range Meter Bar */}
      <div className="my-1.5 space-y-1">
        <div className="h-1.5 w-full bg-[#111c33] rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isCritical
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : isWarning
                ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                : 'bg-gradient-to-r from-blue-500 to-emerald-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Bottom row: Expected range */}
      <div className="pt-2 border-t border-[#182643] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="text-slate-500">Normal Range:</span>
        <span className="text-slate-300 font-semibold">{param.normalRange}</span>
      </div>
    </div>
  );
};
