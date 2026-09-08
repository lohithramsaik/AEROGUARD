import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Activity, Layers, CheckSquare, Square, Brain, ShieldCheck } from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

type GraphMetricKey =
  | 'rpm'
  | 'cht'
  | 'egt'
  | 'oilTemp'
  | 'oilPressure'
  | 'fuelPressure'
  | 'vibration'
  | 'manifoldPressure'
  | 'engineTorque';

interface MetricOption {
  key: GraphMetricKey;
  label: string;
  unit: string;
  color: string;
  expectedKey?: string;
  aiKey?: string;
}

const AVAILABLE_METRICS: MetricOption[] = [
  { key: 'cht', label: 'CHT (Cylinder Temp)', unit: '°C', color: '#ff1744', expectedKey: 'chtExpected', aiKey: 'chtAi' },
  { key: 'rpm', label: 'Engine RPM', unit: 'RPM', color: '#00f0ff', expectedKey: 'rpmExpected', aiKey: 'rpmAi' },
  { key: 'oilPressure', label: 'Oil Pressure', unit: 'PSI', color: '#00e676', expectedKey: 'oilPressureExpected', aiKey: 'oilPressureAi' },
  { key: 'egt', label: 'EGT (Exhaust)', unit: '°C', color: '#ffab00', expectedKey: 'egtExpected', aiKey: 'egtAi' },
  { key: 'oilTemp', label: 'Oil Temperature', unit: '°C', color: '#ff9100' },
  { key: 'fuelPressure', label: 'Fuel Pressure', unit: 'PSI', color: '#2979ff' },
  { key: 'vibration', label: 'Vibration', unit: 'g', color: '#b388ff', expectedKey: 'vibrationExpected', aiKey: 'vibrationAi' },
  { key: 'manifoldPressure', label: 'Manifold Pressure', unit: 'inHg', color: '#00e5ff' },
  { key: 'engineTorque', label: 'Engine Torque', unit: 'Nm', color: '#ffd600' },
];

export const MultiParameterLiveGraph: React.FC = () => {
  const { history, simulationMode } = useEngine();

  // Multi-select active metrics (defaults to CHT and Oil Pressure to demonstrate thermal/lubrication cross-correlation)
  const [selectedMetrics, setSelectedMetrics] = useState<GraphMetricKey[]>(['cht', 'oilPressure']);

  // Series visibility toggles
  const [showMeasured, setShowMeasured] = useState(true);
  const [showExpected, setShowExpected] = useState(true);
  const [showAiEstimate, setShowAiEstimate] = useState(true);

  const toggleMetric = (key: GraphMetricKey) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  return (
    <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 shadow-xl space-y-3 font-mono text-xs">
      {/* Top Bar: Title & Overlay Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1b2b48] pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Multi-Parameter Real-Time Graph (Synchronized 5-Min Rolling Telemetry)
          </h3>
        </div>

        {/* Model Stream Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowMeasured(!showMeasured)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition text-[11px] ${
              showMeasured
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-[#0e172a] border-[#1e2f50] text-slate-500'
            }`}
          >
            <span className="w-2 h-0.5 bg-cyan-400"></span>
            <span>MEASURED / SIMULATED (Solid)</span>
          </button>

          <button
            onClick={() => setShowExpected(!showExpected)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition text-[11px] ${
              showExpected
                ? 'bg-amber-950/70 border-amber-400 text-amber-300 font-bold'
                : 'bg-[#0e172a] border-[#1e2f50] text-slate-500'
            }`}
          >
            <span className="w-2 h-0.5 border-t-2 border-dashed border-amber-400"></span>
            <span>EXPECTED BASELINE (Dashed)</span>
          </button>

          <button
            onClick={() => setShowAiEstimate(!showAiEstimate)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition text-[11px] ${
              showAiEstimate
                ? 'bg-purple-950/70 border-purple-400 text-purple-300 font-bold'
                : 'bg-[#0e172a] border-[#1e2f50] text-slate-500'
            }`}
          >
            <Brain className="w-3 h-3 text-purple-400" />
            <span>AI ESTIMATE (Dotted)</span>
          </button>
        </div>
      </div>

      {/* Multi-Select Metric Checkbox Pills */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
          Select Parameters to Plot ({selectedMetrics.length} Selected):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_METRICS.map((m) => {
            const isSelected = selectedMetrics.includes(m.key);
            return (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-[#121e36] border-slate-400 text-slate-100 shadow-sm'
                    : 'bg-[#0e172a] border-[#1b2b48] text-slate-500 hover:text-slate-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? m.color : '#475569' }}
                ></span>
                <span>{m.label}</span>
                <span className="text-[9px] text-slate-400">({m.unit})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Large Chart Canvas */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#152238" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="timestamp"
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={{ stroke: '#1e293b' }}
              interval={10}
            />

            <YAxis
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={{ stroke: '#1e293b' }}
              domain={['auto', 'auto']}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0a101d',
                borderColor: '#1e2c45',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />

            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }}
            />

            {/* Render lines for each selected metric */}
            {selectedMetrics.map((key) => {
              const meta = AVAILABLE_METRICS.find((m) => m.key === key);
              if (!meta) return null;

              return (
                <React.Fragment key={key}>
                  {/* 1. Measured Value (Solid line) */}
                  {showMeasured && (
                    <Line
                      type="monotone"
                      dataKey={key}
                      name={`${meta.label} [Measured]`}
                      stroke={meta.color}
                      strokeWidth={2.2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}

                  {/* 2. Expected Value (Dashed line) */}
                  {showExpected && meta.expectedKey && (
                    <Line
                      type="monotone"
                      dataKey={meta.expectedKey}
                      name={`${meta.label} [Expected]`}
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}

                  {/* 3. AI Estimate (Dotted line) */}
                  {showAiEstimate && meta.aiKey && (
                    <Line
                      type="monotone"
                      dataKey={meta.aiKey}
                      name={`${meta.label} [AI Twin]`}
                      stroke="#c084fc"
                      strokeWidth={1.8}
                      strokeDasharray="2 2"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#182643] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="text-cyan-400">STATUS: REAL-TIME STREAMING (50 Hz)</span>
          <span>BUFFER: 300 SECONDS</span>
        </div>
        <div className="text-slate-500">
          Cross-compare thermal, pressure, and mechanical signatures during fault injection
        </div>
      </div>
    </div>
  );
};
