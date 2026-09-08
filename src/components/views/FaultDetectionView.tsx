import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Eye,
  Activity,
  Cpu,
  Clock,
  ChevronRight,
  Flame,
  Droplets,
  Radio,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';
import { FaultDetailModal } from '../faults/FaultDetailModal';
import { DetailedFault, FaultState, FaultSeverity } from '../../types/engine';

export const FaultDetectionView: React.FC = () => {
  const {
    allFaults,
    activeFaults,
    monitoringFaults,
    resolvedFaults,
    selectedFault,
    setSelectedFault,
    status,
    simulationMode,
  } = useEngine();

  const [activeTab, setActiveTab] = useState<'ALL' | FaultState>('ALL');

  const filteredFaults = allFaults.filter((f) => {
    if (activeTab === 'ALL') return true;
    return f.state === activeTab;
  });

  const criticalCount = allFaults.filter((f) => f.state === 'ACTIVE' && f.severity === 'CRITICAL').length;
  const warningCount = allFaults.filter((f) => f.state === 'ACTIVE' && f.severity === 'WARNING').length;

  return (
    <div className="space-y-4">
      {/* 0. Central Simulator Panel */}
      <FaultSimulatorPanel />

      {/* 1. Master Alert Hierarchy Banner */}
      {criticalCount > 0 ? (
        <div className="rounded-xl border-2 border-rose-500 bg-gradient-to-r from-rose-950 via-[#200e19] to-[#120a16] p-4 shadow-[0_0_30px_rgba(255,23,68,0.3)] animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-3 text-rose-200 font-mono">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-rose-600 text-white shadow-lg shadow-rose-950">
              <AlertOctagon className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
                <h2 className="text-base font-black tracking-wider uppercase">
                  MASTER WARNING: {criticalCount} CRITICAL ENGINE FAULT(S) ACTIVE
                </h2>
              </div>
              <p className="text-xs text-rose-300 font-sans mt-0.5">
                Parameters exceeding structural safety margins. Immediate operator review and fault isolation required.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-3 py-1 bg-rose-600/90 text-white rounded font-bold uppercase tracking-wider">
              PRIORITY LEVEL 1
            </span>
          </div>
        </div>
      ) : warningCount > 0 ? (
        <div className="rounded-xl border border-amber-500/70 bg-gradient-to-r from-amber-950/70 via-[#1c1712] to-[#12121c] p-4 shadow-[0_0_20px_rgba(255,171,0,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-200 font-mono">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-600 text-black">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <h2 className="text-base font-black tracking-wider uppercase">
                  CAUTION: {warningCount} OPERATIONAL WARNING(S) DETECTED
                </h2>
              </div>
              <p className="text-xs text-amber-300/90 font-sans mt-0.5">
                Engine parameter trending near boundary limits. Precautionary monitoring engaged.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-3 py-1 bg-amber-600 text-black rounded font-bold uppercase tracking-wider">
              ADVISORY
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#0c182a] to-[#0a1222] p-3.5 flex items-center justify-between gap-3 text-emerald-300 font-mono">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase">
                ALL PROPULSION TELEMETRY NOMINAL — NO ACTIVE ALARMS
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Continuous autoencoder fault classifier active. Residual error threshold &lt; 0.05.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
            0 ACTIVE FAULTS
          </span>
        </div>
      )}

      {/* 2. Top Stats Bar & Tabs Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'ALL'
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                : 'bg-[#0e172a] border-[#1e2f50] text-slate-400 hover:text-white'
            }`}
          >
            All Faults ({allFaults.length})
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold shadow-[0_0_8px_rgba(255,23,68,0.2)]'
                : 'bg-[#0e172a] border-[#1e2f50] text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Active ({activeFaults.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MONITORING')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'MONITORING'
                ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                : 'bg-[#0e172a] border-[#1e2f50] text-slate-400 hover:text-white'
            }`}
          >
            Monitoring ({monitoringFaults.length})
          </button>

          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'RESOLVED'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-[#0e172a] border-[#1e2f50] text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({resolvedFaults.length})
          </button>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Critical: {criticalCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Warning: {warningCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Resolved: {resolvedFaults.length}</span>
          </span>
        </div>
      </div>

      {/* 3. Professional Fault Table */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl overflow-hidden shadow-xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0e172a] border-b border-[#1b2b48] text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3.5">Detection Time</th>
                <th className="py-3 px-3.5">Parameter</th>
                <th className="py-3 px-3.5">Fault Description</th>
                <th className="py-3 px-3.5">Current Value</th>
                <th className="py-3 px-3.5">Expected Range</th>
                <th className="py-3 px-3.5">Severity</th>
                <th className="py-3 px-3.5">AI Confidence</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17253f] text-slate-300">
              {filteredFaults.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-200 uppercase">
                        NO FAULTS IN CATEGORY '{activeTab}'
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-sm">
                        All monitored engine transducers and mechanical subsystems are operating within certified continuous airworthiness limits.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFaults.map((fault) => {
                  const isCrit = fault.severity === 'CRITICAL';
                  const isWarn = fault.severity === 'WARNING';
                  const isActive = fault.state === 'ACTIVE';

                  return (
                    <tr
                      key={fault.id}
                      onClick={() => setSelectedFault(fault)}
                      className={`cursor-pointer transition-colors group ${
                        isActive
                          ? isCrit
                            ? 'bg-[#18111e]/90 hover:bg-[#201427]'
                            : 'bg-[#181615]/90 hover:bg-[#221e1a]'
                          : 'hover:bg-[#0f192e]'
                      }`}
                    >
                      {/* Detection Time */}
                      <td className="py-3 px-3.5 font-bold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{fault.detectionTime}</span>
                      </td>

                      {/* Parameter */}
                      <td className="py-3 px-3.5 font-bold text-cyan-300 whitespace-nowrap">
                        {fault.parameter}
                      </td>

                      {/* Fault Name */}
                      <td className="py-3 px-3.5 font-semibold text-slate-100 max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCrit ? 'bg-rose-500 animate-ping' : isWarn ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                          ></span>
                          <span>{fault.name}</span>
                        </div>
                      </td>

                      {/* Current Value */}
                      <td className="py-3 px-3.5 font-black whitespace-nowrap">
                        <span className={isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-slate-100'}>
                          {fault.currentValue}
                        </span>
                      </td>

                      {/* Expected Range */}
                      <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap">
                        {fault.expectedRange}
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                            isCrit
                              ? 'bg-rose-600 text-white animate-pulse'
                              : isWarn
                              ? 'bg-amber-500 text-black'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {fault.severity}
                        </span>
                      </td>

                      {/* AI Confidence */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-purple-300">{fault.aiConfidence}%</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fault.state === 'ACTIVE'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60'
                              : fault.state === 'MONITORING'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {fault.state}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFault(fault);
                          }}
                          className="px-2.5 py-1 rounded bg-[#132038] group-hover:bg-cyan-950 border border-slate-700 group-hover:border-cyan-500/50 text-cyan-300 text-[11px] font-semibold transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-[#0a101f] border-t border-[#1b2b48] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
          <span>Click any row to open the in-depth diagnostic hypotheses & recommended actions.</span>
          <span className="text-cyan-400 font-semibold">
            TOTAL DETECTIONS LOGGED: {allFaults.length}
          </span>
        </div>
      </div>

      {/* 4. Fault Detail Modal */}
      <FaultDetailModal fault={selectedFault} onClose={() => setSelectedFault(null)} />
    </div>
  );
};
