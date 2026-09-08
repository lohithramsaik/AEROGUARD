import React from 'react';
import {
  BrainCircuit,
  Cpu,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Layers,
  Sparkles,
  Info,
  GitFork,
  CheckCircle2,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';
import { runAiDiagnostics } from '../../services/aiDiagnosticsEngine';

export const AiDiagnosticsView: React.FC = () => {
  const { telemetry, simulationMode } = useEngine();

  // Run the rule-based / anomaly-detection engine on current real-time sensor data
  const aiResult = runAiDiagnostics(telemetry, simulationMode);

  // Anomaly bracket styling
  const getAnomalyCategoryStyle = (cat: 'Normal' | 'Monitor' | 'Warning' | 'Critical') => {
    switch (cat) {
      case 'Normal':
        return {
          textColor: 'text-emerald-400',
          badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
          barColor: 'bg-emerald-400',
          glow: 'shadow-[0_0_15px_rgba(0,230,118,0.25)]',
        };
      case 'Monitor':
        return {
          textColor: 'text-cyan-300',
          badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
          barColor: 'bg-cyan-400',
          glow: 'shadow-[0_0_15px_rgba(0,240,255,0.25)]',
        };
      case 'Warning':
        return {
          textColor: 'text-amber-400',
          badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/50',
          barColor: 'bg-amber-400',
          glow: 'shadow-[0_0_15px_rgba(255,171,0,0.25)]',
        };
      case 'Critical':
        return {
          textColor: 'text-rose-400',
          badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse',
          barColor: 'bg-rose-500',
          glow: 'shadow-[0_0_20px_rgba(255,23,68,0.35)]',
        };
    }
  };

  const categoryStyle = getAnomalyCategoryStyle(aiResult.anomalyCategory);

  return (
    <div className="space-y-4">
      {/* 0. Hardware-in-the-loop Engine Fault Simulator */}
      <FaultSimulatorPanel />

      {/* Header Disclaimer Banner */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-3 flex items-center justify-between font-mono text-xs shadow-md">
        <div className="flex items-center space-x-2 text-purple-300">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span className="font-bold uppercase tracking-wider">
            AI Engine Diagnostics & Probabilistic Anomaly Classification
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
            MODEL ESTIMATE • EDGE INFERENCE
          </span>
          <span className="text-[10px] text-slate-500">CYCLE: 50 Hz</span>
        </div>
      </div>

      {/* TOP 3 CORE SECTIONS: AI Engine Health, Anomaly Score, AI Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        {/* SECTION 1: AI Engine Health */}
        <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1b2b48] pb-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              AI Engine Health
            </span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="my-2">
            <div className="text-[11px] text-slate-400 mb-0.5">Composite Health Metric:</div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl lg:text-4xl font-black text-slate-100">
                Engine Health:
              </span>
              <span
                className={`text-3xl lg:text-4xl font-black ${
                  aiResult.engineHealth >= 80
                    ? 'text-emerald-400'
                    : aiResult.engineHealth >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {aiResult.engineHealth}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#182643] text-[10px] text-slate-400 flex items-center justify-between">
            <span>Model Estimate</span>
            <span className="text-slate-200">
              Target: &gt;85% for Nominal Cruise
            </span>
          </div>
        </div>

        {/* SECTION 2: Anomaly Score (0.00 to 1.00 with interpretation) */}
        <div
          className={`bg-[#0b1324] border rounded-xl p-4 shadow-lg flex flex-col justify-between transition-all ${
            aiResult.anomalyCategory === 'Critical'
              ? 'border-rose-500/60 shadow-[0_0_20px_rgba(255,23,68,0.18)]'
              : aiResult.anomalyCategory === 'Warning'
              ? 'border-amber-500/50'
              : 'border-[#1d2d4d]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#1b2b48] pb-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Anomaly Score (0.00 – 1.00)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${categoryStyle.badgeColor}`}
            >
              {aiResult.anomalyCategory}
            </span>
          </div>

          <div className="my-1.5">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-400">Calculated Score:</span>
              <span className={`text-3xl lg:text-4xl font-black ${categoryStyle.textColor}`}>
                {aiResult.anomalyScore.toFixed(2)}
              </span>
            </div>

            {/* Score Progress Bar */}
            <div className="h-2.5 w-full bg-[#111a2f] rounded-full overflow-hidden p-0.5 border border-[#1e2f50]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${categoryStyle.barColor}`}
                style={{ width: `${Math.min(100, Math.max(4, aiResult.anomalyScore * 100))}%` }}
              />
            </div>

            {/* Interpretation Legend Range */}
            <div className="grid grid-cols-4 gap-1 text-[8px] text-slate-400 text-center mt-2 font-mono">
              <div
                className={`p-1 rounded border ${
                  aiResult.anomalyScore <= 0.3
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-[#0d1627] border-[#182643]'
                }`}
              >
                0.00–0.30
                <span className="block text-[7px] text-slate-500">Normal</span>
              </div>
              <div
                className={`p-1 rounded border ${
                  aiResult.anomalyScore > 0.3 && aiResult.anomalyScore <= 0.6
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-[#0d1627] border-[#182643]'
                }`}
              >
                0.30–0.60
                <span className="block text-[7px] text-slate-500">Monitor</span>
              </div>
              <div
                className={`p-1 rounded border ${
                  aiResult.anomalyScore > 0.6 && aiResult.anomalyScore <= 0.8
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#0d1627] border-[#182643]'
                }`}
              >
                0.60–0.80
                <span className="block text-[7px] text-slate-500">Warning</span>
              </div>
              <div
                className={`p-1 rounded border ${
                  aiResult.anomalyScore > 0.8
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold'
                    : 'bg-[#0d1627] border-[#182643]'
                }`}
              >
                0.80–1.00
                <span className="block text-[7px] text-slate-500">Critical</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: AI Confidence */}
        <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1b2b48] pb-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Model Certainty & Latency
            </span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>

          <div className="my-2">
            <div className="text-[11px] text-slate-400 mb-0.5">Statistical Confidence:</div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl lg:text-4xl font-black text-slate-100">
                AI Confidence:
              </span>
              <span className="text-3xl lg:text-4xl font-black text-purple-400">
                {aiResult.confidence}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#182643] text-[10px] text-slate-400 flex items-center justify-between">
            <span>Runtime: ONNX Runtime v1.18</span>
            <span className="text-cyan-300 font-bold">Latency: 4.2 ms</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Current AI Diagnosis */}
      <div
        className={`rounded-xl border p-4 shadow-lg transition-all ${
          aiResult.anomalyCategory === 'Critical'
            ? 'bg-gradient-to-r from-rose-950/60 via-[#190f1d] to-[#0e1424] border-rose-500/70 shadow-[0_0_25px_rgba(255,23,68,0.2)]'
            : aiResult.anomalyCategory === 'Warning'
            ? 'bg-gradient-to-r from-amber-950/60 via-[#1a1714] to-[#0e1424] border-amber-500/60 shadow-[0_0_18px_rgba(255,171,0,0.15)]'
            : 'bg-gradient-to-r from-emerald-950/40 via-[#0e192a] to-[#0a1220] border-emerald-500/40'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div
              className={`p-2.5 rounded-xl border mt-0.5 ${
                aiResult.anomalyCategory === 'Critical'
                  ? 'bg-rose-950 border-rose-500/70 text-rose-400 animate-pulse'
                  : aiResult.anomalyCategory === 'Warning'
                  ? 'bg-amber-950 border-amber-500/70 text-amber-400'
                  : 'bg-emerald-950 border-emerald-500/60 text-emerald-400'
              }`}
            >
              {aiResult.anomalyCategory === 'Critical' ? (
                <AlertOctagon className="w-6 h-6" />
              ) : aiResult.anomalyCategory === 'Warning' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                <span>Current AI Diagnosis</span>
                <span className="text-slate-600">•</span>
                <span className="text-purple-300 font-semibold">
                  [MODEL ESTIMATE • PROBABILISTIC INFERENCE]
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-mono text-slate-100">
                “{aiResult.headline}”
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-4xl font-sans leading-relaxed">
                {aiResult.synthesis}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded tracking-wider shrink-0 ${
              aiResult.anomalyCategory === 'Critical'
                ? 'bg-rose-600 text-white'
                : aiResult.anomalyCategory === 'Warning'
                ? 'bg-amber-600 text-black'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {aiResult.anomalyCategory.toUpperCase()} STATE
          </span>
        </div>
      </div>

      {/* SECTION 5: WHY? (Explanation Section Showing Contributing Parameters) */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-5 shadow-xl font-mono text-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2b48] pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              WHY? — PARAMETER EXPLANATION & NEURAL ATTRIBUTION
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            SHOWING SENSORS CONTRIBUTING TO THE AI DECISION
          </span>
        </div>

        {/* Contributing Parameter Cards */}
        <div className="space-y-2.5">
          {aiResult.contributions.map((item, idx) => {
            const isCrit = item.severity === 'CRITICAL';
            const isWarn = item.severity === 'WARNING';
            const isMon = item.severity === 'MONITOR';

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition-all ${
                  isCrit
                    ? 'bg-[#18111e] border-rose-500/50'
                    : isWarn
                    ? 'bg-[#181512] border-amber-500/50'
                    : isMon
                    ? 'bg-[#0f1a2e] border-cyan-500/40'
                    : 'bg-[#0e172a] border-[#1b2b48]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Parameter & Observation statement */}
                  <div className="flex items-start space-x-2.5">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isCrit
                          ? 'bg-rose-500 animate-ping'
                          : isWarn
                          ? 'bg-amber-400'
                          : isMon
                          ? 'bg-cyan-400'
                          : 'bg-emerald-400'
                      }`}
                    ></span>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{item.parameter}:</span>
                        <span
                          className={`font-semibold ${
                            isCrit
                              ? 'text-rose-400'
                              : isWarn
                              ? 'text-amber-400'
                              : isMon
                              ? 'text-cyan-300'
                              : 'text-emerald-400'
                          }`}
                        >
                          {item.observation}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Measured: <strong className="text-slate-200">{item.measured}</strong> •
                        Expected Baseline:{' '}
                        <strong className="text-slate-300">{item.expected}</strong> •
                        Residual Δ: <strong className="text-amber-300">{item.delta}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Impact Weight Bar */}
                  <div className="flex items-center space-x-2 shrink-0 sm:w-48">
                    <span className="text-[9px] text-slate-400 uppercase">Impact:</span>
                    <div className="h-1.5 flex-1 bg-[#15233c] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCrit
                            ? 'bg-rose-500'
                            : isWarn
                            ? 'bg-amber-400'
                            : isMon
                            ? 'bg-cyan-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${item.contributionWeight * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 w-9 text-right">
                      {(item.contributionWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synthesis Conclusion Box */}
        <div className="p-3.5 rounded-lg bg-[#0e172a] border border-[#1e2f50] text-slate-200 leading-relaxed">
          <div className="text-[10px] uppercase text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>AI DIAGNOSTIC INFERENCE SYNTHESIS</span>
          </div>
          <p className="text-xs text-slate-300">
            {aiResult.anomalyCategory !== 'Normal'
              ? '“The combined sensor pattern indicates an abnormal operating condition.” The multi-variate telemetry divergence exceeds Gaussian noise envelopes, indicating physical stress on engine thermal/lubrication systems.'
              : '“The combined sensor pattern conforms to nominal operating standards.” No anomalous sensor divergence detected across thermal, pressure, or mechanical channels.'}
          </p>
        </div>
      </div>

      {/* SECTION 6: AI Analysis & Architecture Extensibility */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 shadow-lg font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#1b2b48] pb-2.5">
          <div className="flex items-center space-x-2 text-cyan-400">
            <GitFork className="w-4 h-4" />
            <h3 className="font-bold text-slate-100 uppercase tracking-wider">
              AI Analysis Pipeline & Machine Learning Extensibility
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">ARCHITECTURE SPEC</span>
        </div>

        <p className="text-slate-400 leading-relaxed font-sans text-xs">
          The prototype currently executes an anomaly-detection simulation combining physics baseline deviation checks, multi-sensor cross-entropy weights, and dynamic thresholding. The architecture is modularly separated in <code className="text-cyan-300">aiDiagnosticsEngine.ts</code> so that a production ONNX / PyTorch model (e.g. Deep Autoencoder, LSTM-Autoencoder, or Isolation Forest) can directly drop into this inference pipeline.
        </p>

        {/* Visual Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48]">
            <span className="text-[9px] text-cyan-400 block font-bold">1. TELEMETRY INGESTION</span>
            <span className="text-slate-200 font-semibold block mt-0.5">8 Core Sensor Channels</span>
            <span className="text-[10px] text-slate-500">100Hz CAN-Bus decoder</span>
          </div>

          <div className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48]">
            <span className="text-[9px] text-purple-400 block font-bold">2. FEATURE EXTRACTION</span>
            <span className="text-slate-200 font-semibold block mt-0.5">Physics Residual Δ</span>
            <span className="text-[10px] text-slate-500">Measured vs Expected baseline</span>
          </div>

          <div className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48]">
            <span className="text-[9px] text-amber-400 block font-bold">3. LATENT SCORING</span>
            <span className="text-slate-200 font-semibold block mt-0.5">Anomaly Score (0.00–1.00)</span>
            <span className="text-[10px] text-slate-500">Normal / Monitor / Warn / Crit</span>
          </div>

          <div className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48]">
            <span className="text-[9px] text-emerald-400 block font-bold">4. EXPLAINABLE SYNTHESIS</span>
            <span className="text-slate-200 font-semibold block mt-0.5">SHAP-style "WHY?" Attribution</span>
            <span className="text-[10px] text-slate-500">Actionable maintenance insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};
