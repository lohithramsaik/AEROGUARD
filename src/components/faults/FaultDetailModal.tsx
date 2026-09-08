import React from 'react';
import {
  X,
  AlertOctagon,
  AlertTriangle,
  Brain,
  Clock,
  Cpu,
  Layers,
  Wrench,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { DetailedFault } from '../../types/engine';

interface FaultDetailModalProps {
  fault: DetailedFault | null;
  onClose: () => void;
}

export const FaultDetailModal: React.FC<FaultDetailModalProps> = ({ fault, onClose }) => {
  if (!fault) return null;

  const isCritical = fault.severity === 'CRITICAL';
  const isWarning = fault.severity === 'WARNING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1324] border border-[#23355b] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isCritical
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : isWarning
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg border ${
                isCritical
                  ? 'bg-rose-950 border-rose-500/60 text-rose-400 animate-pulse'
                  : isWarning
                  ? 'bg-amber-950 border-amber-500/60 text-amber-400'
                  : 'bg-emerald-950 border-emerald-500/60 text-emerald-400'
              }`}
            >
              {isCritical ? (
                <AlertOctagon className="w-5 h-5" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {fault.id}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    fault.state === 'ACTIVE'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : fault.state === 'MONITORING'
                      ? 'bg-amber-600 text-black'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {fault.state}
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-slate-100 mt-0.5">
                {fault.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs text-slate-300">
          {/* Top Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1b2b48]">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Affected Parameter
              </span>
              <span className="text-sm font-bold text-cyan-300 mt-0.5 block">
                {fault.parameter}
              </span>
            </div>

            <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1b2b48]">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Current Value
              </span>
              <span
                className={`text-sm font-black mt-0.5 block ${
                  isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-100'
                }`}
              >
                {fault.currentValue}
              </span>
            </div>

            <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1b2b48]">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Expected Value / Range
              </span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 block">
                {fault.expectedValue}{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({fault.expectedRange})
                </span>
              </span>
            </div>

            <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1b2b48]">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Deviation (Δ)
              </span>
              <span className="text-sm font-black text-amber-400 mt-0.5 block">
                {fault.deviation}
              </span>
            </div>
          </div>

          {/* Secondary Telemetry: Severity, AI Confidence, Detection Time */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1b2b48]">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Severity Level
              </span>
              <span
                className={`text-xs font-black mt-0.5 inline-block px-2 py-0.5 rounded ${
                  isCritical
                    ? 'bg-rose-600 text-white'
                    : isWarning
                    ? 'bg-amber-500 text-black'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {fault.severity}
              </span>
            </div>

            <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1b2b48]">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                AI Confidence Score
              </span>
              <span className="text-sm font-bold text-purple-300 mt-0.5 block">
                {fault.aiConfidence}% (ONNX Inferred)
              </span>
            </div>

            <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1b2b48]">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Detection Time
              </span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 block">
                {fault.detectionTime} UTC
              </span>
            </div>
          </div>

          {/* Affected System */}
          <div className="bg-[#0f1a30] p-3.5 rounded-lg border border-[#1e2f52]">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1">
              <Layers className="w-4 h-4" />
              <span className="uppercase tracking-wider text-xs">Affected Subsystem</span>
            </div>
            <p className="text-slate-200 font-medium">{fault.affectedSystem}</p>
          </div>

          {/* Possible Causes with Engineering Disclaimer */}
          <div className="bg-[#0f1a30] p-4 rounded-lg border border-[#1e2f52] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <HelpCircle className="w-4 h-4" />
                <span className="uppercase tracking-wider text-xs">Possible Causes</span>
              </div>
              <span className="text-[10px] text-slate-400 italic">
                DIFFERENTIAL DIAGNOSTIC HYPOTHESES
              </span>
            </div>

            <ul className="space-y-1.5 pl-2">
              {fault.possibleCauses.map((cause, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-300">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>

            <div className="mt-2 pt-2 border-t border-[#1a2845] text-[10px] text-slate-400 italic">
              Note: The AI diagnostics engine highlights these plausible root causes based on historical sensor signatures and physics correlations. They are investigative hypotheses and do not replace physical borescope or certified maintenance inspection.
            </div>
          </div>

          {/* Recommended Investigation */}
          <div className="bg-[#0f1a30] p-4 rounded-lg border border-[#1e2f52] space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Wrench className="w-4 h-4" />
              <span className="uppercase tracking-wider text-xs">
                Recommended Maintenance Investigation
              </span>
            </div>

            <ul className="space-y-1.5 pl-2">
              {fault.recommendedInvestigation.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-200">
                  <span className="text-emerald-400 font-bold">[{idx + 1}]</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#080e1c] border-t border-[#1b2b48] flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400 text-[10px]">
            ACTION LOG: FLIGHT RECORDER CHANNEL 04
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#14223d] hover:bg-[#1a2f55] border border-cyan-500/40 text-cyan-300 font-semibold transition"
          >
            Close Detail Panel
          </button>
        </div>
      </div>
    </div>
  );
};
