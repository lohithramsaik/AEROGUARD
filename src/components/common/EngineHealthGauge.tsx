import React from 'react';
import { Plane, Brain, AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

export const EngineHealthGauge: React.FC = () => {
  const { healthMetrics, status } = useEngine();
  const { engineHealth, droneHealth, aiConfidence, activeFaultCount, activeWarningCount } = healthMetrics;

  // Circular gauge SVG mathematics (radius 68)
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc (3/4 of circle)
  const strokeDashoffset = circumference - (circumference * (engineHealth / 100) * 0.75);

  const getHealthColor = (score: number) => {
    if (score >= 85) return { stroke: '#00e676', text: 'text-emerald-400', glow: 'rgba(0,230,118,0.4)' };
    if (score >= 70) return { stroke: '#ffab00', text: 'text-amber-400', glow: 'rgba(255,171,0,0.4)' };
    return { stroke: '#ff1744', text: 'text-rose-500', glow: 'rgba(255,23,68,0.5)' };
  };

  const healthStyle = getHealthColor(engineHealth);

  return (
    <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 flex flex-col justify-between h-full shadow-lg relative overflow-hidden">
      {/* Panel Title */}
      <div className="flex items-center justify-between border-b border-[#1b2b48] pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
            Engine Health & Telemetry Metrics
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101b33] border border-[#1e2f50] text-cyan-300">
          HEALTH COEFF. V3.1
        </span>
      </div>

      {/* Center: Big Circular Gauge */}
      <div className="flex flex-col items-center justify-center my-1 relative">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#15213b"
              strokeWidth="12"
              strokeDasharray={`${circumference * 0.75} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Active Health Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={healthStyle.stroke}
              strokeWidth="12"
              strokeDasharray={`${circumference * 0.75} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${healthStyle.glow})`,
              }}
            />
          </svg>

          {/* Central Health Value Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              Engine Health
            </span>
            <div className="flex items-baseline space-x-1">
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${healthStyle.text}`}>
                {Math.round(engineHealth)}
              </span>
              <span className={`text-lg font-bold font-mono ${healthStyle.text}`}>%</span>
            </div>
            <span
              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded mt-0.5 ${
                engineHealth >= 85
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : engineHealth >= 70
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}
            >
              {engineHealth >= 85 ? 'OPTIMAL' : engineHealth >= 70 ? 'DEGRADED' : 'CRITICAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Companion Metrics */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#1b2b48] font-mono text-xs">
        {/* Drone Health */}
        <div className="bg-[#0f192c] p-2.5 rounded border border-[#1e2f50] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plane className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400">Drone Health</div>
              <div className="text-sm font-bold text-slate-100">{droneHealth}%</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>

        {/* AI Confidence */}
        <div className="bg-[#0f192c] p-2.5 rounded border border-[#1e2f50] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400">AI Confidence</div>
              <div className="text-sm font-bold text-slate-100">{aiConfidence}%</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
        </div>

        {/* Active Fault Count */}
        <div
          className={`p-2.5 rounded border flex items-center justify-between ${
            activeFaultCount > 0
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              : 'bg-[#0f192c] border-[#1e2f50] text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertOctagon
              className={`w-4 h-4 ${activeFaultCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}
            />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400">Active Faults</div>
              <div className="text-sm font-bold">{activeFaultCount}</div>
            </div>
          </div>
          {activeFaultCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.2 bg-rose-500 text-white font-bold rounded">
              FAIL
            </span>
          )}
        </div>

        {/* Active Warning Count */}
        <div
          className={`p-2.5 rounded border flex items-center justify-between ${
            activeWarningCount > 0
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-[#0f192c] border-[#1e2f50] text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle
              className={`w-4 h-4 ${activeWarningCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}
            />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400">Active Warnings</div>
              <div className="text-sm font-bold">{activeWarningCount}</div>
            </div>
          </div>
          {activeWarningCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-black font-bold rounded">
              WARN
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
