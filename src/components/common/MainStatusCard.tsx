import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Radio,
  Layers,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

export const MainStatusCard: React.FC = () => {
  const {
    status,
    activeFaults,
    simulationMode,
    isSensorFaultActive,
    sensorFaultNotification,
    aiAnalysis,
    telemetry,
    healthStatus,
  } = useEngine();

  let stateConfig = {
    title: 'ENGINE NORMAL',
    dotColor: 'bg-emerald-400',
    borderColor: 'border-emerald-500/50',
    bgGradient: 'from-emerald-950/40 via-[#0c192c] to-[#0a1424]',
    textColor: 'text-emerald-400',
    icon: ShieldCheck,
    subtitle: 'All propulsion parameters within nominal operating envelope. AI residual error normal.',
    actionBadge: 'CRUISE READY • NO INTERVENTION REQUIRED',
    badgeStyle: 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40',
  };

  // When a sensor fault occurs without an engine fault, preserve ENGINE NORMAL
  if (status === 'NORMAL' && isSensorFaultActive && sensorFaultNotification) {
    stateConfig = {
      title: 'ENGINE NORMAL • SENSOR FAULT',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.18)]',
      bgGradient: 'from-amber-950/30 via-[#101a2c] to-[#0a1424]',
      textColor: 'text-amber-300',
      icon: AlertTriangle,
      subtitle: `${sensorFaultNotification.sensorName} is ${sensorFaultNotification.status}. Engine mechanical operation verified nominal. AI virtual sensor active.`,
      actionBadge: 'AVIONICS SENSOR FAULT • ENGINE OPERATING NORMALLY',
      badgeStyle: 'bg-amber-950/60 text-amber-300 border-amber-500/50',
    };
  } else if (status === 'WARNING') {
    stateConfig = {
      title: 'WARNING',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-500/60 shadow-[0_0_25px_rgba(255,171,0,0.18)]',
      bgGradient: 'from-amber-950/40 via-[#1a1c22] to-[#0d1524]',
      textColor: 'text-amber-400',
      icon: AlertTriangle,
      subtitle: `${activeFaults.length} parameter(s) approaching operational limit. Precautionary monitoring engaged.`,
      actionBadge: 'ADVISORY ALERT • MONITOR TELEMETRY TRENDS',
      badgeStyle: 'bg-amber-900/50 text-amber-300 border-amber-500/50',
    };
  } else if (status === 'FAULT') {
    stateConfig = {
      title: 'ENGINE FAULT DETECTED',
      dotColor: 'bg-rose-500 animate-ping',
      borderColor: 'border-rose-500/70 shadow-[0_0_35px_rgba(255,23,68,0.25)]',
      bgGradient: 'from-rose-950/50 via-[#1a111a] to-[#0e1222]',
      textColor: 'text-rose-400',
      icon: AlertOctagon,
      subtitle: `CRITICAL PROPULSION FAULT: ${activeFaults[0]?.name || 'Engine threshold exceeded'}. Mechanical degradation confirmed across multi-sensor cross-coupling.`,
      actionBadge: 'CRITICAL ENGINE FAULT • INITIATE CONTINGENCY',
      badgeStyle: 'bg-rose-900/60 text-rose-200 border-rose-500/60 animate-pulse',
    };
  }

  const Icon = stateConfig.icon;
  const primaryFault = activeFaults[0];

  // Derive Answers to the 6 Core Operational Questions
  const q1Normal = status === 'NORMAL';
  const q2Fault = status !== 'NORMAL';
  const q3AbnormalParam = primaryFault
    ? `${primaryFault.parameter}: ${primaryFault.currentValue} (${primaryFault.deviation})`
    : 'None (All in Nominal Range)';
  const q4AffectedSystem = primaryFault
    ? primaryFault.affectedSystem
    : 'All 6 Subsystems Optimal';
  const q5AiOpinion = aiAnalysis?.diagnosisHeadline || 'Nominal Physics Envelope Tracking';
  const q6Trend = primaryFault
    ? primaryFault.severity === 'CRITICAL'
      ? 'Deteriorating (Escalating Excursion)'
      : 'Degrading (Precautionary Limit)'
    : 'Stable (Continuous Equilibrium)';

  return (
    <div
      className={`rounded-xl border ${stateConfig.borderColor} bg-gradient-to-r ${stateConfig.bgGradient} p-5 relative overflow-hidden transition-all duration-300 shadow-xl`}
    >
      {/* Background HUD Grid accents */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-grid-tactical opacity-25 pointer-events-none" />

      {/* Top Banner Row: Icon, Status, Subtitle, Directives */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 mb-4 pb-4 border-b border-slate-800/80">
        {/* Left: Icon & Big Status Readout */}
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${
              status === 'NORMAL'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-emerald-950'
                : status === 'WARNING'
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-400 shadow-amber-950'
                : 'bg-rose-950/70 border-rose-500/60 text-rose-400 shadow-rose-950 animate-pulse'
            }`}
          >
            <Icon className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className={`w-3 h-3 rounded-full ${stateConfig.dotColor} inline-block`} />
              <h2
                className={`text-2xl md:text-3xl font-black tracking-wider uppercase font-mono ${stateConfig.textColor}`}
              >
                {stateConfig.title}
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-300 font-sans mt-0.5 max-w-xl">
              {stateConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Operational Directive & Mode */}
        <div className="flex flex-col md:items-end space-y-2 font-mono shrink-0">
          <div
            className={`px-3 py-1 rounded-md text-xs font-bold border tracking-wider flex items-center gap-1.5 ${stateConfig.badgeStyle}`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{stateConfig.actionBadge}</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>
              SOURCE:{' '}
              <strong className="text-cyan-300 font-semibold">
                {simulationMode === 'NORMAL' ? 'NOMINAL FLIGHT ENVELOPE' : `FAULT INJECTION [${simulationMode}]`}
              </strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>AI CONF: {aiAnalysis?.confidence ?? 94}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 6 Critical Operational Answers Grid (Always Obvious At First Glance) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 relative z-10 font-mono text-xs">
        {/* Question 1: Engine Normal? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${q1Normal ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`} />
            1. ENGINE NORMAL?
          </span>
          <div className="mt-1">
            <span className={`text-sm font-black ${q1Normal ? 'text-emerald-400' : 'text-rose-400'}`}>
              {q1Normal ? 'YES • NOMINAL' : 'NO • ABNORMAL'}
            </span>
            <div className="text-[10px] text-slate-400 truncate">Health: {healthStatus.engineHealth}%</div>
          </div>
        </div>

        {/* Question 2: Is There a Fault? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${q2Fault ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
            2. ACTIVE FAULT?
          </span>
          <div className="mt-1">
            <span className={`text-sm font-black ${q2Fault ? 'text-rose-400' : 'text-emerald-400'}`}>
              {q2Fault ? `${activeFaults.length} FAULT(S) ACTIVE` : '0 FAULTS ACTIVE'}
            </span>
            <div className="text-[10px] text-slate-400 truncate">
              {q2Fault ? activeFaults[0]?.severity : 'Continuous Airworthy'}
            </div>
          </div>
        </div>

        {/* Question 3: What Parameter is Abnormal? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            3. EXCURSION PARAM
          </span>
          <div className="mt-1">
            <div className={`text-xs font-bold truncate ${q2Fault ? 'text-rose-300 font-black' : 'text-slate-200'}`} title={q3AbnormalParam}>
              {primaryFault ? primaryFault.parameter : 'All In Tolerance'}
            </div>
            <div className="text-[10px] text-cyan-300 truncate">
              {primaryFault ? `${primaryFault.currentValue} (${primaryFault.deviation})` : 'Nominal Cruise Limits'}
            </div>
          </div>
        </div>

        {/* Question 4: What System is Affected? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" />
            4. AFFECTED SYSTEM
          </span>
          <div className="mt-1">
            <div className={`text-xs font-bold truncate ${q2Fault ? 'text-amber-300' : 'text-slate-200'}`} title={q4AffectedSystem}>
              {q4AffectedSystem.split('&')[0].trim()}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {q2Fault ? 'Thermal / Mech Stress' : '6 Circuits Optimal'}
            </div>
          </div>
        </div>

        {/* Question 5: What Does the AI Think? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
            <BrainCircuit className="w-3 h-3 text-cyan-400" />
            5. AI INFERENCE
          </span>
          <div className="mt-1">
            <div className={`text-xs font-bold truncate ${aiAnalysis?.anomalyScore > 0.6 ? 'text-rose-400' : 'text-emerald-400'}`} title={q5AiOpinion}>
              Score: {aiAnalysis?.anomalyScore.toFixed(2)} ({aiAnalysis?.anomalyCategory})
            </div>
            <div className="text-[10px] text-slate-400 truncate" title={q5AiOpinion}>
              {q5AiOpinion}
            </div>
          </div>
        </div>

        {/* Question 6: Is the Condition Getting Worse? */}
        <div className="p-2.5 rounded-lg bg-[#0a1120]/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
            {q2Fault ? (
              <TrendingDown className="w-3 h-3 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            )}
            6. CONDITION TREND
          </span>
          <div className="mt-1">
            <div className={`text-xs font-bold truncate ${q2Fault ? 'text-rose-400' : 'text-emerald-400'}`}>
              {q2Fault ? 'DETERIORATING' : 'STABLE'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {q2Fault ? 'Degrading Excursion' : 'Equilibrium (±0.0%)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
