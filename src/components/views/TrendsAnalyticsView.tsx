import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Layers,
  BarChart3,
  CheckCircle2,
  Download,
  Maximize2,
  Grid,
  Sliders,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';
import { TelemetryHistoryPoint } from '../../types/engine';

export type TimeRangeKey = '5m' | '15m' | '30m' | '1h' | 'flight';

export type AnalyticsParamKey =
  | 'rpm'
  | 'cht'
  | 'egt'
  | 'oilTemp'
  | 'oilPressure'
  | 'vibration'
  | 'fuelFlow'
  | 'engineLoad';

export interface ParamMeta {
  key: AnalyticsParamKey;
  label: string;
  shortLabel: string;
  unit: string;
  color: string;
  expectedMin: number;
  expectedMax: number;
  criticalLimit: number;
  criticalType: 'above' | 'below';
  description: string;
}

export const PARAM_METAS: Record<AnalyticsParamKey, ParamMeta> = {
  rpm: {
    key: 'rpm',
    label: 'Engine RPM',
    shortLabel: 'RPM',
    unit: 'RPM',
    color: '#00f0ff',
    expectedMin: 2200,
    expectedMax: 2600,
    criticalLimit: 2800,
    criticalType: 'above',
    description: 'Propulsion rotational speed and governor stability',
  },
  cht: {
    key: 'cht',
    label: 'Cylinder Head Temp (CHT)',
    shortLabel: 'CHT',
    unit: '°C',
    color: '#ff1744',
    expectedMin: 150,
    expectedMax: 190,
    criticalLimit: 200,
    criticalType: 'above',
    description: 'Peak cylinder head metal thermal flux',
  },
  egt: {
    key: 'egt',
    label: 'Exhaust Gas Temp (EGT)',
    shortLabel: 'EGT',
    unit: '°C',
    color: '#ffab00',
    expectedMin: 680,
    expectedMax: 740,
    criticalLimit: 780,
    criticalType: 'above',
    description: 'Post-combustion runner exhaust temperature',
  },
  oilTemp: {
    key: 'oilTemp',
    label: 'Oil Temperature',
    shortLabel: 'Oil Temp',
    unit: '°C',
    color: '#ff9100',
    expectedMin: 80,
    expectedMax: 105,
    criticalLimit: 118,
    criticalType: 'above',
    description: 'Dry-sump lubricant reservoir temperature',
  },
  oilPressure: {
    key: 'oilPressure',
    label: 'Oil Pressure',
    shortLabel: 'Oil Press',
    unit: 'PSI',
    color: '#00e676',
    expectedMin: 45,
    expectedMax: 65,
    criticalLimit: 30,
    criticalType: 'below',
    description: 'Hydrodynamic crankshaft journal scavenge pressure',
  },
  vibration: {
    key: 'vibration',
    label: 'Engine Vibration',
    shortLabel: 'Vibration',
    unit: 'g',
    color: '#b388ff',
    expectedMin: 0.40,
    expectedMax: 1.20,
    criticalLimit: 2.00,
    criticalType: 'above',
    description: 'Tri-axial accelerometer crankcase resonance',
  },
  fuelFlow: {
    key: 'fuelFlow',
    label: 'Fuel Flow Rate',
    shortLabel: 'Fuel Flow',
    unit: 'L/h',
    color: '#38bdf8',
    expectedMin: 18.0,
    expectedMax: 26.0,
    criticalLimit: 29.0,
    criticalType: 'above',
    description: 'Electronic fuel injection delivery rate',
  },
  engineLoad: {
    key: 'engineLoad',
    label: 'Engine Load',
    shortLabel: 'Load',
    unit: '%',
    color: '#f43f5e',
    expectedMin: 50.0,
    expectedMax: 80.0,
    criticalLimit: 88.0,
    criticalType: 'above',
    description: 'Calculated continuous thermodynamic duty cycle',
  },
};

export interface ComputedParamStats {
  avg: number;
  min: number;
  max: number;
  stdDev: number;
  anomalyCount: number;
  faultCount: number;
}

// Compute standard statistical metrics for any parameter
export const computeParamStats = (
  data: TelemetryHistoryPoint[],
  meta: ParamMeta
): ComputedParamStats => {
  if (!data || data.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      anomalyCount: 0,
      faultCount: 0,
    };
  }

  const values = data.map((d) => Number(d[meta.key]));
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  const variance =
    values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  let anomalyCount = 0;
  let faultCount = 0;

  data.forEach((d) => {
    const v = Number(d[meta.key]);
    const isOutsideExpected =
      meta.criticalType === 'below'
        ? v < meta.expectedMin
        : v > meta.expectedMax || v < meta.expectedMin;

    const isCriticalFault =
      meta.criticalType === 'below'
        ? v <= meta.criticalLimit
        : v >= meta.criticalLimit;

    if (d.isAnomaly || isOutsideExpected) {
      anomalyCount++;
    }
    if (d.isFault || isCriticalFault) {
      faultCount++;
    }
  });

  return {
    avg: Number(avg.toFixed(1)),
    min: Number(min.toFixed(1)),
    max: Number(max.toFixed(1)),
    stdDev: Number(stdDev.toFixed(2)),
    anomalyCount,
    faultCount,
  };
};

// Compute fault segment intervals for visual red shading
export const computeFaultRanges = (
  data: TelemetryHistoryPoint[],
  meta: ParamMeta
) => {
  const ranges: { start: string; end: string; name: string }[] = [];
  let activeStart: string | null = null;
  let activeName = 'Fault Period';

  data.forEach((d, idx) => {
    const v = Number(d[meta.key]);
    const isCriticalFault =
      meta.criticalType === 'below'
        ? v <= meta.criticalLimit
        : v >= meta.criticalLimit;

    const isFaultCondition = d.isFault || isCriticalFault;

    if (isFaultCondition) {
      if (!activeStart) {
        activeStart = d.timestamp;
        activeName = d.faultName || 'Fault Period';
      }
    } else {
      if (activeStart) {
        ranges.push({
          start: activeStart,
          end: data[idx - 1]?.timestamp || activeStart,
          name: activeName,
        });
        activeStart = null;
      }
    }
  });

  if (activeStart && data.length > 0) {
    ranges.push({
      start: activeStart,
      end: data[data.length - 1].timestamp,
      name: activeName,
    });
  }

  return ranges;
};

export const TrendsAnalyticsView: React.FC = () => {
  const { history, telemetry } = useEngine();

  // Selected Parameter & Time Range
  const [selectedParam, setSelectedParam] = useState<AnalyticsParamKey>('cht');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeKey>('15m');
  const [viewLayout, setViewLayout] = useState<'deepDive' | 'allCharts' | 'stacked'>('deepDive');

  const activeMeta = PARAM_METAS[selectedParam];

  // Filter history based on strictly calculated seconds duration
  const filteredData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const latestSec =
      history[history.length - 1]?.timeSec || Math.floor(Date.now() / 1000);

    let secondsWindow = 300; // 5m
    switch (selectedTimeRange) {
      case '5m':
        secondsWindow = 5 * 60;
        break;
      case '15m':
        secondsWindow = 15 * 60;
        break;
      case '30m':
        secondsWindow = 30 * 60;
        break;
      case '1h':
        secondsWindow = 60 * 60;
        break;
      case 'flight':
      default:
        secondsWindow = Infinity;
        break;
    }

    const filtered = history.filter(
      (item) => latestSec - (item.timeSec || 0) <= secondsWindow
    );

    // If filtered points are too few for meaningful chart view (e.g. at app start), provide minimum slice
    if (filtered.length < 10 && history.length >= 10) {
      const fallbackPoints =
        selectedTimeRange === '5m'
          ? 30
          : selectedTimeRange === '15m'
          ? 60
          : selectedTimeRange === '30m'
          ? 120
          : selectedTimeRange === '1h'
          ? 240
          : history.length;
      return history.slice(-Math.min(fallbackPoints, history.length));
    }

    return filtered;
  }, [history, selectedTimeRange]);

  // Transform data for chart with explicit anomaly & fault point overlays
  const chartPoints = useMemo(() => {
    return filteredData.map((d) => {
      const v = Number(d[selectedParam]);
      const isOutside =
        activeMeta.criticalType === 'below'
          ? v < activeMeta.expectedMin
          : v > activeMeta.expectedMax || v < activeMeta.expectedMin;

      const isCritical =
        activeMeta.criticalType === 'below'
          ? v <= activeMeta.criticalLimit
          : v >= activeMeta.criticalLimit;

      const isAnomalyPoint = d.isAnomaly || isOutside;
      const isFaultPoint = d.isFault || isCritical;

      return {
        ...d,
        paramVal: v,
        anomalyMarker: isAnomalyPoint ? v : null,
        faultMarker: isFaultPoint ? v : null,
      };
    });
  }, [filteredData, selectedParam, activeMeta]);

  // Compute statistics for the selected parameter
  const activeStats = useMemo(() => {
    return computeParamStats(filteredData, activeMeta);
  }, [filteredData, activeMeta]);

  // Detect active fault period segments in the filtered data for visual shading
  const activeFaultRanges = useMemo(() => {
    return computeFaultRanges(filteredData, activeMeta);
  }, [filteredData, activeMeta]);

  // Compute summary stats for all 8 parameters (cached)
  const allParamsStats = useMemo(() => {
    const map: Record<AnalyticsParamKey, ComputedParamStats> = {} as any;
    (Object.keys(PARAM_METAS) as AnalyticsParamKey[]).forEach((key) => {
      map[key] = computeParamStats(filteredData, PARAM_METAS[key]);
    });
    return map;
  }, [filteredData]);

  // Export telemetry as downloadable CSV
  const handleExportCsv = () => {
    if (!filteredData || filteredData.length === 0) return;

    const headers = [
      'Timestamp',
      'EpochSec',
      'RPM',
      'CHT_C',
      'EGT_C',
      'OilTemp_C',
      'OilPressure_PSI',
      'Vibration_g',
      'FuelFlow_Lph',
      'EngineLoad_pct',
      'IsAnomaly',
      'IsFault',
      'FaultName',
    ];

    const rows = filteredData.map((d) => [
      d.timestamp,
      d.timeSec || '',
      d.rpm,
      d.cht,
      d.egt,
      d.oilTemp,
      d.oilPressure,
      d.vibration,
      d.fuelFlow,
      d.engineLoad,
      d.isAnomaly ? 'TRUE' : 'FALSE',
      d.isFault ? 'TRUE' : 'FALSE',
      d.faultName ? `"${d.faultName}"` : '""',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `aero_engine_telemetry_${selectedTimeRange}_${new Date().toISOString().slice(0, 19)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 0. Real-Time Hardware-in-the-Loop Fault Simulation Bench */}
      <FaultSimulatorPanel />

      {/* Top Header & Analytics Control Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-[#0b1324] border border-[#1b2b48] p-4 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
              Trends & Statistical Telemetry Analytics
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              HISTORICAL DATA STORE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal trend evaluation, baseline deviation analysis, anomaly clusters, and simulated fault identification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* View Layout Toggle */}
          <div className="flex items-center bg-[#070d19] border border-[#1e2f50] rounded-lg p-0.5">
            <button
              onClick={() => setViewLayout('deepDive')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition text-xs ${
                viewLayout === 'deepDive'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Focused Deep-Dive with High-Resolution Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Focused View</span>
            </button>

            <button
              onClick={() => setViewLayout('allCharts')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition text-xs ${
                viewLayout === 'allCharts'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View All 8 Parameter Charts Simultaneously"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All 8 Charts</span>
            </button>

            <button
              onClick={() => setViewLayout('stacked')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition text-xs ${
                viewLayout === 'stacked'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Synchronized Flight Recorder Strip Stack"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Strip Stack</span>
            </button>
          </div>

          {/* Time Range Selector Buttons */}
          <div className="flex items-center space-x-1 bg-[#070d19] border border-[#1e2f50] rounded-lg p-0.5">
            <span className="text-[10px] text-slate-400 px-2 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>TIME:</span>
            </span>
            {[
              { key: '5m', label: 'Last 5 min' },
              { key: '15m', label: 'Last 15 min' },
              { key: '30m', label: 'Last 30 min' },
              { key: '1h', label: 'Last hour' },
              { key: 'flight', label: 'Flight' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedTimeRange(item.key as TimeRangeKey)}
                className={`px-2.5 py-1 rounded-md transition ${
                  selectedTimeRange === item.key
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14223b] hover:bg-[#1a2d50] text-slate-300 border border-[#24375b] transition font-bold"
            title="Download full historical telemetry buffer as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 8 Parameter Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 font-mono text-xs">
        {(Object.keys(PARAM_METAS) as AnalyticsParamKey[]).map((key) => {
          const item = PARAM_METAS[key];
          const isSelected = selectedParam === key;
          const curVal = telemetry[key];
          const pStats = allParamsStats[key];
          const hasFault = pStats ? pStats.faultCount > 0 : false;
          const hasAnomaly = pStats ? pStats.anomalyCount > 0 : false;

          return (
            <button
              key={key}
              onClick={() => setSelectedParam(key)}
              className={`px-3 py-2 rounded-lg border transition flex items-center justify-between gap-2.5 min-w-[140px] ${
                isSelected
                  ? 'bg-[#15233e] border-cyan-400 text-cyan-300 font-bold shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-[#0b1324] border-[#1b2b48] text-slate-400 hover:text-slate-200 hover:border-[#253a63]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-slate-200 font-medium">{item.shortLabel}</span>
              </div>

              <div className="flex items-center space-x-1.5 text-right">
                <span className="font-bold text-slate-100">
                  {curVal}
                  <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                    {item.unit}
                  </span>
                </span>
                {hasFault ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                ) : hasAnomaly ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* 1. VIEW MODE: FOCUSED DEEP-DIVE */}
      {viewLayout === 'deepDive' && (
        <div className="space-y-4">
          {/* SUMMARY STATISTICS SECTION (6 CARDS REQUIRED BY USER SPEC) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            {/* 1. Average */}
            <div className="bg-[#0b1324] border border-[#1d2d4d] p-3 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/5 rounded-bl-2xl"></div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                Average (Mean)
              </span>
              <span className="text-xl lg:text-2xl font-black text-slate-100 mt-1 block">
                {activeStats.avg}{' '}
                <span className="text-xs text-cyan-400 font-normal">
                  {activeMeta.unit}
                </span>
              </span>
              <span className="text-[10px] text-slate-500">
                Mean across {selectedTimeRange.toUpperCase()} window
              </span>
            </div>

            {/* 2. Minimum */}
            <div className="bg-[#0b1324] border border-[#1d2d4d] p-3 rounded-xl shadow-lg relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                Minimum (Floor)
              </span>
              <span className="text-xl lg:text-2xl font-bold text-slate-200 mt-1 block">
                {activeStats.min}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  {activeMeta.unit}
                </span>
              </span>
              <span className="text-[10px] text-slate-500">Lowest Recorded</span>
            </div>

            {/* 3. Maximum */}
            <div className="bg-[#0b1324] border border-[#1d2d4d] p-3 rounded-xl shadow-lg relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                Maximum (Peak)
              </span>
              <span
                className={`text-xl lg:text-2xl font-black mt-1 block ${
                  activeMeta.criticalType === 'below'
                    ? activeStats.max < activeMeta.expectedMin
                      ? 'text-rose-400'
                      : 'text-slate-100'
                    : activeStats.max >= activeMeta.expectedMax
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {activeStats.max}{' '}
                <span className="text-xs font-normal text-slate-400">
                  {activeMeta.unit}
                </span>
              </span>
              <span className="text-[10px] text-slate-500">Peak Recorded Value</span>
            </div>

            {/* 4. Standard Deviation */}
            <div className="bg-[#0b1324] border border-[#1d2d4d] p-3 rounded-xl shadow-lg relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                Std Deviation (σ)
              </span>
              <span className="text-xl lg:text-2xl font-black text-purple-300 mt-1 block">
                ±{activeStats.stdDev}
              </span>
              <span className="text-[10px] text-slate-500">
                Gaussian dispersion index
              </span>
            </div>

            {/* 5. Number of Anomalies */}
            <div
              className={`border p-3 rounded-xl shadow-lg transition-all relative overflow-hidden ${
                activeStats.anomalyCount > 0
                  ? 'bg-[#1b151b] border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-[#0b1324] border-[#1d2d4d] text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Number of Anomalies
                </span>
                {activeStats.anomalyCount > 0 && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                )}
              </div>
              <span className="text-xl lg:text-2xl font-black mt-1 block">
                {activeStats.anomalyCount}
              </span>
              <span className="text-[10px] text-slate-500">
                Envelope exceedance events
              </span>
            </div>

            {/* 6. Number of Faults */}
            <div
              className={`border p-3 rounded-xl shadow-lg transition-all relative overflow-hidden ${
                activeStats.faultCount > 0
                  ? 'bg-[#220f18] border-rose-500/80 text-rose-300 ring-1 ring-rose-500/50'
                  : 'bg-[#0b1324] border-[#1d2d4d] text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Number of Faults
                </span>
                {activeStats.faultCount > 0 && (
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                )}
              </div>
              <span className="text-xl lg:text-2xl font-black mt-1 block text-rose-400">
                {activeStats.faultCount}
              </span>
              <span className="text-[10px] text-slate-500">
                Critical excursion periods
              </span>
            </div>
          </div>

          {/* MASTER HISTORICAL DEEP-DIVE CHART */}
          <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-5 shadow-2xl font-mono text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2b48] pb-3">
              <div className="flex items-center space-x-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow"
                  style={{ backgroundColor: activeMeta.color }}
                ></span>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  {activeMeta.label} Historical Profile — [{activeMeta.unit}]
                </h3>
              </div>

              {/* Visual Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-2 rounded-sm"
                    style={{ backgroundColor: activeMeta.color }}
                  ></span>
                  <span className="text-slate-200">Actual Value</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-emerald-500/20 border border-emerald-500/50 rounded-sm"></span>
                  <span className="text-emerald-400">
                    Expected ({activeMeta.expectedMin}–{activeMeta.expectedMax}{' '}
                    {activeMeta.unit})
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white"></span>
                  <span className="text-amber-300">Anomalies</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-rose-500/35 border border-rose-500/80 rounded-sm"></span>
                  <span className="text-rose-400 font-bold">Fault Period</span>
                </span>
              </div>
            </div>

            {/* High-Contrast Interactive Chart Canvas */}
            <div className="h-88 w-full pt-2" style={{ height: '360px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartPoints}
                  margin={{ top: 15, right: 25, left: -5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id={`gradient-master-${activeMeta.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={activeMeta.color}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={activeMeta.color}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#152238"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="timestamp"
                    stroke="#475569"
                    tick={{
                      fill: '#64748b',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono',
                    }}
                    tickLine={{ stroke: '#1e293b' }}
                    interval={Math.max(1, Math.floor(chartPoints.length / 8))}
                  />

                  <YAxis
                    stroke="#475569"
                    tick={{
                      fill: '#64748b',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono',
                    }}
                    tickLine={{ stroke: '#1e293b' }}
                    domain={['auto', 'auto']}
                  />

                  {/* 1. EXPECTED RANGE: Shaded Green Reference Band */}
                  <ReferenceArea
                    y1={activeMeta.expectedMin}
                    y2={activeMeta.expectedMax}
                    fill="#00e676"
                    fillOpacity={0.08}
                    stroke="#00e676"
                    strokeOpacity={0.25}
                    strokeDasharray="3 3"
                  />

                  {/* 2. FAULT PERIODS: Visually Identifiable Shaded Red Bands */}
                  {activeFaultRanges.map((fr, idx) => (
                    <ReferenceArea
                      key={`fault-area-${idx}`}
                      x1={fr.start}
                      x2={fr.end}
                      fill="#ff1744"
                      fillOpacity={0.25}
                      stroke="#ff1744"
                      strokeOpacity={0.85}
                      label={{
                        value: `⚠️ ${fr.name.toUpperCase()}`,
                        fill: '#ff5252',
                        fontSize: 10,
                        position: 'insideTop',
                        fontWeight: 'bold',
                      }}
                    />
                  ))}

                  {/* Expected Boundaries Reference Lines */}
                  <ReferenceLine
                    y={activeMeta.expectedMax}
                    stroke="#ffab00"
                    strokeDasharray="4 4"
                    label={{
                      value: `Max Limit: ${activeMeta.expectedMax} ${activeMeta.unit}`,
                      fill: '#ffab00',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />

                  {activeMeta.expectedMin && (
                    <ReferenceLine
                      y={activeMeta.expectedMin}
                      stroke="#00e676"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                      label={{
                        value: `Min: ${activeMeta.expectedMin} ${activeMeta.unit}`,
                        fill: '#00e676',
                        fontSize: 9,
                        position: 'insideBottomRight',
                      }}
                    />
                  )}

                  {activeMeta.criticalLimit && (
                    <ReferenceLine
                      y={activeMeta.criticalLimit}
                      stroke="#ff1744"
                      strokeDasharray="2 2"
                      label={{
                        value: `CRITICAL: ${activeMeta.criticalLimit} ${activeMeta.unit}`,
                        fill: '#ff1744',
                        fontSize: 10,
                        position:
                          activeMeta.criticalType === 'below'
                            ? 'insideBottomLeft'
                            : 'insideTopLeft',
                      }}
                    />
                  )}

                  {/* High Precision Tooltip */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a101d',
                      borderColor: '#1e2c45',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                      color: '#e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dataItem = payload[0].payload;
                        const val = dataItem.paramVal;
                        const isAnom = Boolean(dataItem.anomalyMarker !== null);
                        const isFlt = Boolean(dataItem.faultMarker !== null);

                        return (
                          <div className="bg-[#090f1c] border border-[#1f2f4c] p-3 rounded-lg shadow-xl font-mono text-xs">
                            <div className="text-slate-400 font-bold border-b border-[#1b2b48] pb-1 mb-1.5 flex justify-between gap-4">
                              <span>TIME: {label} UTC</span>
                              <span
                                className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                                  isFlt
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : isAnom
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {isFlt
                                  ? '🔴 CRITICAL FAULT'
                                  : isAnom
                                  ? '🟡 ANOMALY'
                                  : '🟢 NOMINAL'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between gap-6 text-slate-200">
                                <span>{activeMeta.label}:</span>
                                <span className="font-bold text-cyan-300">
                                  {val} {activeMeta.unit}
                                </span>
                              </div>

                              <div className="flex justify-between gap-6 text-slate-400 text-[10px]">
                                <span>Expected Envelope:</span>
                                <span>
                                  {activeMeta.expectedMin} – {activeMeta.expectedMax}{' '}
                                  {activeMeta.unit}
                                </span>
                              </div>

                              {dataItem.faultName && (
                                <div className="text-rose-400 text-[10px] font-bold pt-1 border-t border-[#1b2b48]">
                                  Fault Mode: {dataItem.faultName}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* 3. ACTUAL VALUE: High-Resolution Monotone Area */}
                  <Area
                    type="monotone"
                    dataKey="paramVal"
                    stroke={activeMeta.color}
                    strokeWidth={2.6}
                    fillOpacity={1}
                    fill={`url(#gradient-master-${activeMeta.key})`}
                    isAnimationActive={false}
                  />

                  {/* 4. ANOMALIES: Plotted as Distinct Amber Points directly on the curve */}
                  <Line
                    type="monotone"
                    dataKey="anomalyMarker"
                    stroke="none"
                    isAnimationActive={false}
                    dot={{
                      r: 4.5,
                      fill: '#ffab00',
                      stroke: '#ffffff',
                      strokeWidth: 1.5,
                    }}
                    activeDot={{ r: 6.5 }}
                  />

                  {/* 5. FAULTS: Plotted as Glowing Red Points directly on the curve */}
                  <Line
                    type="monotone"
                    dataKey="faultMarker"
                    stroke="none"
                    isAnimationActive={false}
                    dot={{
                      r: 5,
                      fill: '#ff1744',
                      stroke: '#ffffff',
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Master Chart Footer Info */}
            <div className="pt-2.5 border-t border-[#182643] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {activeMeta.description} • Expected: {activeMeta.expectedMin}–
                  {activeMeta.expectedMax} {activeMeta.unit}
                </span>
              </span>
              <span className="text-cyan-400 font-semibold">
                SAMPLES ANALYZED: {chartPoints.length} SAMPLES ({selectedTimeRange.toUpperCase()})
              </span>
            </div>
          </div>

          {/* 8-CHANNEL SYNCHRONIZED MULTI-CHART PREVIEW GRID */}
          <section className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  8-Channel Synchronized Fleet Overview Grid ({selectedTimeRange.toUpperCase()})
                </h3>
              </div>
              <span className="text-[10px] text-slate-500">
                CLICK ANY MINI-CHART TO EXPAND DEEP-DIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(PARAM_METAS) as AnalyticsParamKey[]).map((key) => {
                const m = PARAM_METAS[key];
                const isSelected = selectedParam === key;
                const currentVal = telemetry[key];
                const st = allParamsStats[key];

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedParam(key)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#132039] border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                        : 'bg-[#0b1324] border-[#1d2d4d] hover:border-[#2a3e68]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                        <span className="text-[11px] font-bold text-slate-200">
                          {m.shortLabel}
                        </span>
                      </div>
                      <span className="text-xs font-black text-cyan-300">
                        {currentVal} {m.unit}
                      </span>
                    </div>

                    {/* Mini Sparkline Chart */}
                    <div className="h-16 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={filteredData}
                          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                        >
                          <Area
                            type="monotone"
                            dataKey={key}
                            stroke={m.color}
                            strokeWidth={1.8}
                            fill={m.color}
                            fillOpacity={0.15}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-[#182643]">
                      <span>
                        Avg: {st.avg} | Anom: {st.anomalyCount}
                      </span>
                      <span className="text-slate-300 font-semibold">Inspect →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* 2. VIEW MODE: ALL 8 PARAMETER CHARTS (COMPLETE MATRIX VIEW) */}
      {viewLayout === 'allCharts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-400">
              Displaying all 8 propulsion parameters with individual statistical ribbons, expected envelope boundaries, anomalies, and fault periods.
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              WINDOW: {selectedTimeRange.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(Object.keys(PARAM_METAS) as AnalyticsParamKey[]).map((key) => {
              const m = PARAM_METAS[key];
              const st = allParamsStats[key];
              const currentVal = telemetry[key];
              const fRanges = computeFaultRanges(filteredData, m);

              // Map anomaly markers for this specific parameter
              const pChartData = filteredData.map((d) => {
                const val = Number(d[key]);
                const isOutside =
                  m.criticalType === 'below'
                    ? val < m.expectedMin
                    : val > m.expectedMax || val < m.expectedMin;

                const isCrit =
                  m.criticalType === 'below'
                    ? val <= m.criticalLimit
                    : val >= m.criticalLimit;

                return {
                  ...d,
                  pVal: val,
                  pAnomaly: d.isAnomaly || isOutside ? val : null,
                  pFault: d.isFault || isCrit ? val : null,
                };
              });

              return (
                <div
                  key={key}
                  className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 shadow-xl font-mono text-xs space-y-3"
                >
                  {/* Card Header with Name & Live Value */}
                  <div className="flex items-center justify-between border-b border-[#182643] pb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                      <h4 className="font-bold text-slate-100 text-sm">
                        {m.label}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-cyan-300">
                        {currentVal} {m.unit}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedParam(key);
                          setViewLayout('deepDive');
                        }}
                        className="text-[10px] text-slate-400 hover:text-cyan-300 p-1 rounded bg-[#132039] border border-[#203254]"
                        title="Expand to Full Deep-Dive"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Statistics Mini-Ribbon for this Parameter */}
                  <div className="grid grid-cols-6 gap-1 bg-[#070d19] border border-[#16243d] p-1.5 rounded-lg text-center text-[10px]">
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase">
                        Avg
                      </span>
                      <span className="font-bold text-slate-200">{st.avg}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase">
                        Min
                      </span>
                      <span className="font-bold text-slate-200">{st.min}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase">
                        Max
                      </span>
                      <span className="font-bold text-slate-200">{st.max}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase">
                        σ
                      </span>
                      <span className="font-bold text-purple-300">
                        ±{st.stdDev}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase">
                        Anom
                      </span>
                      <span
                        className={`font-bold ${
                          st.anomalyCount > 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {st.anomalyCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase">
                        Faults
                      </span>
                      <span
                        className={`font-bold ${
                          st.faultCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
                        }`}
                      >
                        {st.faultCount}
                      </span>
                    </div>
                  </div>

                  {/* Full Recharts Area for this Parameter */}
                  <div className="h-52 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={pChartData}
                        margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id={`grad-grid-${key}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={m.color}
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor={m.color}
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke="#152238"
                          strokeDasharray="2 2"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="timestamp"
                          stroke="#475569"
                          tick={{ fill: '#64748b', fontSize: 9 }}
                          tickLine={false}
                          interval={Math.max(1, Math.floor(pChartData.length / 6))}
                        />

                        <YAxis
                          stroke="#475569"
                          tick={{ fill: '#64748b', fontSize: 9 }}
                          tickLine={false}
                          domain={['auto', 'auto']}
                        />

                        {/* Expected Range Band */}
                        <ReferenceArea
                          y1={m.expectedMin}
                          y2={m.expectedMax}
                          fill="#00e676"
                          fillOpacity={0.07}
                          stroke="#00e676"
                          strokeOpacity={0.2}
                          strokeDasharray="3 3"
                        />

                        {/* Fault Period Highlight */}
                        {fRanges.map((fr, idx) => (
                          <ReferenceArea
                            key={`fr-grid-${idx}`}
                            x1={fr.start}
                            x2={fr.end}
                            fill="#ff1744"
                            fillOpacity={0.22}
                            stroke="#ff1744"
                            strokeOpacity={0.7}
                          />
                        ))}

                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090f1d',
                            borderColor: '#1f2e4a',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontFamily: 'JetBrains Mono',
                          }}
                          formatter={(val: any) => [`${val} ${m.unit}`, m.shortLabel]}
                        />

                        {/* Actual Curve */}
                        <Area
                          type="monotone"
                          dataKey="pVal"
                          stroke={m.color}
                          strokeWidth={2}
                          fill={`url(#grad-grid-${key})`}
                          isAnimationActive={false}
                        />

                        {/* Anomaly Markers */}
                        <Line
                          type="monotone"
                          dataKey="pAnomaly"
                          stroke="none"
                          isAnimationActive={false}
                          dot={{
                            r: 3.5,
                            fill: '#ffab00',
                            stroke: '#fff',
                            strokeWidth: 1,
                          }}
                        />

                        {/* Fault Markers */}
                        <Line
                          type="monotone"
                          dataKey="pFault"
                          stroke="none"
                          isAnimationActive={false}
                          dot={{
                            r: 4,
                            fill: '#ff1744',
                            stroke: '#fff',
                            strokeWidth: 1.5,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-[#142038]">
                    <span>
                      Envelope: {m.expectedMin}–{m.expectedMax} {m.unit}
                    </span>
                    <span className="text-slate-400">
                      Crit: {m.criticalLimit} {m.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. VIEW MODE: SYNCHRONIZED FLIGHT RECORDER STRIP STACK */}
      {viewLayout === 'stacked' && (
        <div className="space-y-3 bg-[#0b1324] border border-[#1d2d4d] p-4 rounded-xl shadow-2xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#182643] pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-slate-100 uppercase tracking-wider text-xs">
                Synchronized 8-Channel Telemetry Black-Box Strip Stack ({selectedTimeRange.toUpperCase()})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Identical time-axis synchronization for cross-channel anomaly correlation
            </span>
          </div>

          <div className="space-y-2">
            {(Object.keys(PARAM_METAS) as AnalyticsParamKey[]).map((key, i) => {
              const m = PARAM_METAS[key];
              const curVal = telemetry[key];
              const isLast = i === Object.keys(PARAM_METAS).length - 1;

              return (
                <div
                  key={key}
                  className="bg-[#070d19] border border-[#14223a] rounded-lg p-2 flex flex-col md:flex-row md:items-center gap-2"
                >
                  <div className="w-40 flex-shrink-0 flex items-center justify-between pr-2 border-r border-[#14223a]">
                    <span className="text-[11px] font-bold text-slate-300">
                      {m.shortLabel}
                    </span>
                    <span className="text-xs font-black text-cyan-300">
                      {curVal} {m.unit}
                    </span>
                  </div>

                  <div className="h-16 w-full flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={filteredData}
                        margin={{ top: 2, right: 10, left: 0, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="timestamp"
                          hide={!isLast}
                          stroke="#475569"
                          tick={{ fill: '#64748b', fontSize: 8 }}
                          interval={Math.max(1, Math.floor(filteredData.length / 8))}
                        />
                        <YAxis domain={['auto', 'auto']} hide />
                        <ReferenceArea
                          y1={m.expectedMin}
                          y2={m.expectedMax}
                          fill="#00e676"
                          fillOpacity={0.08}
                        />
                        <Area
                          type="monotone"
                          dataKey={key}
                          stroke={m.color}
                          strokeWidth={1.8}
                          fill={m.color}
                          fillOpacity={0.15}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
