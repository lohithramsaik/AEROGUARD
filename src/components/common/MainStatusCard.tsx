import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Layers,
  BrainCircuit,
  TrendingDown,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

export const MainStatusCard: React.FC = () => {
  const {
    status,
    activeFaults,
    isSensorFaultActive,
    sensorFaultNotification,
    aiAnalysis,
    healthStatus,
  } = useEngine();

  const isNormal = status === 'NORMAL';
  const isWarning = status === 'WARNING';
  const isFault = status === 'FAULT';

  const primaryFault = activeFaults[0];

  // Friendly human-understandable messaging
  let headline = 'Engine Operating Normally';
  let message = 'All propulsion parameters are within normal cruise limits.';
  let badgeText = 'Normal • Ready';
  let badgeStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50';
  let borderStyle = 'border-emerald-500/40 bg-gradient-to-br from-[#0c1a2d] via-[#091424] to-[#070e1a]';
  let statusIcon = ShieldCheck;
  let iconColor = 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40';

  if (isNormal && isSensorFaultActive && sensorFaultNotification) {
    headline = 'Engine Normal • Sensor Issue';
    message = `${sensorFaultNotification.sensorName} is ${sensorFaultNotification.status.toLowerCase()}. Engine continues running safely on AI fallback.`;
    badgeText = 'Sensor Alert';
    badgeStyle = 'bg-amber-950/60 text-amber-300 border-amber-500/50';
    borderStyle = 'border-amber-500/50 bg-gradient-to-br from-[#1a1c22] via-[#0d1524] to-[#070e1a]';
    statusIcon = AlertTriangle;
    iconColor = 'text-amber-400 bg-amber-950/70 border-amber-500/40';
  } else if (isWarning) {
    headline = 'Caution: Parameter Elevated';
    message = primaryFault
      ? `${primaryFault.name} (${primaryFault.currentValue}). Approaching cautionary limits.`
      : 'One or more parameters are approaching cautionary limits.';
    badgeText = 'Advisory Warning';
    badgeStyle = 'bg-amber-950/60 text-amber-300 border-amber-500/50';
    borderStyle = 'border-amber-500/50 bg-gradient-to-br from-[#1c1815] via-[#0f1422] to-[#070e1a]';
    statusIcon = AlertTriangle;
    iconColor = 'text-amber-400 bg-amber-950/70 border-amber-500/40';
  } else if (isFault) {
    headline = 'Alert: Engine Fault Detected';
    message = primaryFault
      ? `Critical condition: ${primaryFault.name} (${primaryFault.currentValue}). Check ${primaryFault.affectedSystem}.`
      : 'Critical engine parameter threshold exceeded.';
    badgeText = 'Critical Fault';
    badgeStyle = 'bg-rose-950/80 text-rose-200 border-rose-500/60 animate-pulse';
    borderStyle = 'border-rose-500/60 bg-gradient-to-br from-[#211219] via-[#120f1c] to-[#080b14]';
    statusIcon = AlertOctagon;
    iconColor = 'text-rose-400 bg-rose-950/80 border-rose-500/50 animate-pulse';
  }

  const StatusIconComponent = statusIcon;

  // Answers to the 6 Core Operational Questions
  const q1Text = isNormal ? 'Normal' : 'Abnormal';
  const q2Text = activeFaults.length > 0 ? `${activeFaults.length} Fault` : 'No Faults';
  const q3Text = primaryFault ? `${primaryFault.parameter}: ${primaryFault.currentValue}` : 'None';
  const q4Text = primaryFault ? primaryFault.affectedSystem.split('&')[0].trim() : 'All Healthy';
  const q5Text = aiAnalysis
    ? aiAnalysis.anomalyScore > 0.6
      ? `Risk (${aiAnalysis.anomalyCategory})`
      : 'Normal (Low Risk)'
    : 'Normal';
  const q6Text = activeFaults.length > 0 ? 'Deteriorating' : 'Stable';

  return (
    <div className={`rounded-xl border ${borderStyle} p-4 shadow-xl transition-all`}>
      {/* Top Banner: Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-[#1b2b48]">
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${iconColor}`}>
            <StatusIconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide font-sans">
                {headline}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeStyle}`}>
                {badgeText}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl font-sans">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs shrink-0 font-sans">
          <div className="px-3 py-1.5 rounded-lg bg-[#0e172a] border border-[#1e2f50] text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Engine Health</span>
            <span
              className={`font-black text-sm font-mono ${
                healthStatus.engineHealth >= 85
                  ? 'text-emerald-400'
                  : healthStatus.engineHealth >= 60
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {healthStatus.engineHealth}%
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#0e172a] border border-[#1e2f50] text-right">
            <span className="text-[10px] text-slate-400 block uppercase">AI Confidence</span>
            <span className="font-black text-sm font-mono text-cyan-300">
              {aiAnalysis?.confidence ?? 94}%
            </span>
          </div>
        </div>
      </div>

      {/* The 6 Key Operational Status Indicators (Clean, Moderate, Readable) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {/* 1. Is Engine Normal? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/80 border border-[#182640]">
          <span className="text-[10px] text-slate-400 block font-medium">1. Engine Normal?</span>
          <span className={`text-sm font-bold block mt-0.5 ${isNormal ? 'text-emerald-400' : 'text-rose-400'}`}>
            {q1Text}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {healthStatus.engineHealth}% health
          </span>
        </div>

        {/* 2. Is There a Fault? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/80 border border-[#182640]">
          <span className="text-[10px] text-slate-400 block font-medium">2. Any Fault?</span>
          <span className={`text-sm font-bold block mt-0.5 ${activeFaults.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {q2Text}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {activeFaults.length > 0 ? activeFaults[0]?.severity : 'Within limits'}
          </span>
        </div>

        {/* 3. What Parameter is Abnormal? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/80 border border-[#182640]">
          <span className="text-[10px] text-slate-400 block font-medium">3. Abnormal Param</span>
          <span className={`text-sm font-bold block mt-0.5 truncate ${primaryFault ? 'text-rose-300' : 'text-slate-200'}`} title={q3Text}>
            {q3Text}
          </span>
          <span className="text-[10px] text-slate-500 font-mono truncate block">
            {primaryFault ? primaryFault.expectedRange : 'All within range'}
          </span>
        </div>

        {/* 4. What System is Affected? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/80 border border-[#182640]">
          <span className="text-[10px] text-slate-400 block font-medium">4. Affected System</span>
          <span className={`text-sm font-bold block mt-0.5 truncate ${primaryFault ? 'text-amber-300' : 'text-slate-200'}`} title={q4Text}>
            {q4Text}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {primaryFault ? 'Needs check' : 'All optimal'}
          </span>
        </div>

        {/* 5. What Does AI Think? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/80 border border-[#182640]">
          <span className="text-[10px] text-slate-400 block font-medium">5. AI Assessment</span>
          <span className={`text-sm font-bold block mt-0.5 truncate ${aiAnalysis && aiAnalysis.anomalyScore > 0.6 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {q5Text}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Anomaly: {aiAnalysis?.anomalyScore.toFixed(2) ?? '0.00'}
          </span>
        </div>

        {/* 6. Is Condition Getting Worse? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/80 border border-[#182640]">
          <span className="text-[10px] text-slate-400 block font-medium">6. Condition Trend</span>
          <span className={`text-sm font-bold block mt-0.5 ${activeFaults.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {q6Text}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {activeFaults.length > 0 ? 'Negative trend' : 'Stable cruise'}
          </span>
        </div>
      </div>
    </div>
  );
};
