import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Activity, Maximize2, ShieldAlert } from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

type MetricKey = 'rpm' | 'cht' | 'egt' | 'oilTemp' | 'oilPressure' | 'vibration';

interface MetricMeta {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  fillColor: string;
  normalMin: number;
  normalMax: number;
  criticalLimit: number;
}

const METRIC_CONFIGS: Record<MetricKey, MetricMeta> = {
  rpm: {
    key: 'rpm',
    label: 'RPM',
    unit: 'RPM',
    color: '#00f0ff',
    fillColor: '#00f0ff',
    normalMin: 2200,
    normalMax: 2600,
    criticalLimit: 2800,
  },
  cht: {
    key: 'cht',
    label: 'CHT',
    unit: '°C',
    color: '#ff1744',
    fillColor: '#ff1744',
    normalMin: 150,
    normalMax: 190,
    criticalLimit: 200,
  },
  egt: {
    key: 'egt',
    label: 'EGT',
    unit: '°C',
    color: '#ffab00',
    fillColor: '#ffab00',
    normalMin: 680,
    normalMax: 740,
    criticalLimit: 800,
  },
  oilTemp: {
    key: 'oilTemp',
    label: 'Oil Temp',
    unit: '°C',
    color: '#ff9100',
    fillColor: '#ff9100',
    normalMin: 80,
    normalMax: 105,
    criticalLimit: 120,
  },
  oilPressure: {
    key: 'oilPressure',
    label: 'Oil Pressure',
    unit: 'PSI',
    color: '#00e676',
    fillColor: '#00e676',
    normalMin: 45,
    normalMax: 65,
    criticalLimit: 30,
  },
  vibration: {
    key: 'vibration',
    label: 'Vibration',
    unit: 'g',
    color: '#b388ff',
    fillColor: '#b388ff',
    normalMin: 0.4,
    normalMax: 1.2,
    criticalLimit: 2.5,
  },
};

export const LiveGraph: React.FC = () => {
  const { history, telemetry } = useEngine();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('cht');

  const config = METRIC_CONFIGS[selectedMetric];
  const currentValue = telemetry[selectedMetric];

  // Calculate high, low, avg
  const values = history.map((h) => Number(h[selectedMetric]));
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const avgVal = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0';

  return (
    <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 flex flex-col justify-between shadow-lg h-full">
      {/* Top Controls: Title, Parameter Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1b2b48] pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
            Real-Time Telemetry Trend (5-Min Rolling Window)
          </h3>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {(Object.keys(METRIC_CONFIGS) as MetricKey[]).map((key) => {
            const m = METRIC_CONFIGS[key];
            const isSelected = selectedMetric === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition border ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                    : 'bg-[#0f192c] text-slate-400 border-[#1e2f50] hover:text-slate-200 hover:bg-[#15233c]'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-4 gap-2 mb-3 font-mono text-xs">
        <div className="bg-[#0e172a] p-2 rounded border border-[#1a2845]">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Current</span>
          <span className="text-sm font-black text-slate-100">
            {currentValue} {config.unit}
          </span>
        </div>
        <div className="bg-[#0e172a] p-2 rounded border border-[#1a2845]">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Peak (5m)</span>
          <span className="text-sm font-bold text-slate-200">
            {maxVal} {config.unit}
          </span>
        </div>
        <div className="bg-[#0e172a] p-2 rounded border border-[#1a2845]">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Min (5m)</span>
          <span className="text-sm font-bold text-slate-200">
            {minVal} {config.unit}
          </span>
        </div>
        <div className="bg-[#0e172a] p-2 rounded border border-[#1a2845]">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Mean (5m)</span>
          <span className="text-sm font-bold text-cyan-300">
            {avgVal} {config.unit}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.fillColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={config.fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

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
              formatter={(val: any) => [`${val} ${config.unit}`, config.label]}
            />

            {/* Normal Range Reference Line */}
            <ReferenceLine
              y={config.normalMax}
              stroke="#ffab00"
              strokeDasharray="4 4"
              label={{
                value: `Upper Limit: ${config.normalMax} ${config.unit}`,
                fill: '#ffab00',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />

            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={config.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#gradient-${selectedMetric})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Envelope Boundaries */}
      <div className="mt-2 pt-2 border-t border-[#1b2b48] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }}></span>
          <span>
            OPERATIONAL ENVELOPE: {config.normalMin} – {config.normalMax} {config.unit}
          </span>
        </span>
        <span className="text-slate-500">SAMPLING: 1 Hz ROLLING BUFFER</span>
      </div>
    </div>
  );
};
