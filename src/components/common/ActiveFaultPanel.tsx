import React from 'react';
import { CheckCircle2, AlertOctagon, Brain, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

export const ActiveFaultPanel: React.FC = () => {
  const { activeFaults, setSelectedFault } = useEngine();

  const hasFaults = activeFaults.length > 0;

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col justify-between h-full shadow-lg transition-all ${
        hasFaults
          ? 'bg-[#12111d] border-rose-500/60 shadow-[0_0_20px_rgba(255,23,68,0.15)]'
          : 'bg-[#0b1324] border-[#1d2d4d]'
      }`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1b2b48] pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          {hasFaults ? (
            <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-100">
            Active Fault Diagnostics & Inference
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
            hasFaults
              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {hasFaults ? `${activeFaults.length} FAULT(S) ACTIVE` : 'ALL SYSTEMS GREEN'}
        </span>
      </div>

      {/* Content Area */}
      {!hasFaults ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(0,230,118,0.2)]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold font-mono text-emerald-300 tracking-wider">
            NO ACTIVE FAULTS
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 font-sans">
            “Engine parameters are currently within expected operating conditions.”
          </p>
          <span className="text-[10px] font-mono text-slate-500 mt-2">
            Neural autoencoder anomaly residual &lt; 0.05
          </span>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>FAULT DETECTED</span>
          </div>

          {activeFaults.map((fault) => {
            const isCritical = fault.severity === 'CRITICAL';

            return (
              <div
                key={fault.id}
                onClick={() => setSelectedFault(fault)}
                className="bg-[#181628] border border-rose-500/40 rounded-lg p-3 space-y-2.5 cursor-pointer hover:border-rose-400 transition"
              >
                {/* Fault Name & Severity Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      ID: {fault.id} • {fault.affectedSystem}
                    </span>
                    <h5 className="text-sm font-bold text-slate-100 font-mono">
                      {fault.name}
                    </h5>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-600 text-black'
                    }`}
                  >
                    {fault.severity}
                  </span>
                </div>

                {/* Metrics Grid: Current, Expected, Deviation, AI Confidence */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs pt-1">
                  <div className="bg-[#11101e] p-2 rounded border border-[#2b213b]">
                    <span className="text-[9px] text-slate-400 uppercase block">Current Value</span>
                    <span className="text-rose-400 font-bold text-sm">{fault.currentValue}</span>
                  </div>

                  <div className="bg-[#11101e] p-2 rounded border border-[#2b213b]">
                    <span className="text-[9px] text-slate-400 uppercase block">Expected Value</span>
                    <span className="text-slate-300 font-bold text-sm">{fault.expectedValue}</span>
                  </div>

                  <div className="bg-[#11101e] p-2 rounded border border-[#2b213b]">
                    <span className="text-[9px] text-slate-400 uppercase block">Deviation</span>
                    <span className="text-amber-400 font-bold text-sm">{fault.deviation}</span>
                  </div>

                  <div className="bg-[#11101e] p-2 rounded border border-[#2b213b]">
                    <span className="text-[9px] text-slate-400 uppercase block">AI Confidence</span>
                    <span className="text-cyan-400 font-bold text-sm">{fault.aiConfidence}%</span>
                  </div>
                </div>

                {/* Detection Time & Recommendation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#2b213b] gap-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Detection Time: {fault.detectionTime} UTC</span>
                  </span>
                  <span className="text-cyan-400 text-[10px] underline">
                    Click to view investigation hypothesis →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Diagnostic Metadata */}
      <div className="mt-3 pt-2.5 border-t border-[#1b2b48] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>INFERENCE ENGINE: RESIDUAL ISOLATION FOREST v4</span>
        </span>
        <span className="text-slate-500">CYCLE: 50Hz</span>
      </div>
    </div>
  );
};
