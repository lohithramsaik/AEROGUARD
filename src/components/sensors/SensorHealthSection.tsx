import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

export const SensorHealthSection: React.FC = () => {
  const {
    sensors,
    resetSensorsToNormal,
    isSensorFaultActive,
    sensorFaultNotification,
  } = useEngine();

  // Expanded automatically if there's an active sensor fault, otherwise default collapsed for a clean dashboard
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const avgQuality = Math.round(
    sensors.reduce((acc, s) => acc + s.dataQuality, 0) / sensors.length
  );

  const onlineCount = sensors.filter((s) => s.status === 'ONLINE').length;
  const showFullGrid = isExpanded || isSensorFaultActive;

  return (
    <section className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-3.5 shadow-lg font-sans text-xs space-y-3">
      {/* Summary Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                Sensor Health & Signal Bus
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#14223b] text-cyan-300 border border-cyan-700/50">
                {onlineCount}/8 Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isSensorFaultActive
                ? 'Sensor issue detected. Engine mechanical operation verified nominal.'
                : 'All 8 telemetry sensors are healthy and operating normally.'}
            </p>
          </div>
        </div>

        {/* Quality indicator & Toggle */}
        <div className="flex items-center space-x-2.5">
          <div className="px-2.5 py-1 rounded bg-[#0e172a] border border-[#1b2b48] text-right font-mono text-xs">
            <span className="text-[9px] uppercase text-slate-400 block">Avg Quality</span>
            <span
              className={`font-bold ${
                avgQuality >= 90
                  ? 'text-emerald-400'
                  : avgQuality >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {avgQuality}%
            </span>
          </div>

          {isSensorFaultActive && (
            <button
              onClick={resetSensorsToNormal}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-semibold transition"
              title="Reset all sensors to nominal state"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sensors</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#101b31] hover:bg-[#172747] border border-[#21355a] text-slate-300 hover:text-white transition"
          >
            <span>{showFullGrid ? 'Hide Sensors' : 'View 8 Sensors'}</span>
            {showFullGrid ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Sensor Fault Alert Banner if Active */}
      {isSensorFaultActive && sensorFaultNotification && (
        <div className="p-3 rounded-lg border bg-amber-950/40 border-amber-500/60 text-amber-200 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-xs text-amber-300 block">
                SENSOR FAULT DETECTED — ENGINE MECHANICALLY NORMAL
              </span>
              <span className="text-[11px] text-slate-300">
                {sensorFaultNotification.issue} ({sensorFaultNotification.sensorName}). AI synthetic sensor estimate active.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/60 shrink-0">
            Engine: 🟢 Normal
          </span>
        </div>
      )}

      {/* Grid of 8 Sensors (Only shown when expanded or fault active) */}
      {showFullGrid && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#16233a] animate-fadeIn">
          {sensors.map((sensor) => {
            const isOffline = sensor.status === 'OFFLINE';
            const isDegraded = sensor.status === 'DEGRADED';

            return (
              <div
                key={sensor.id}
                className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                  isOffline
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : isDegraded
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-[#0e172a] border-[#1b2b48]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-slate-200 truncate" title={sensor.name}>
                    {sensor.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-1 ${
                      isOffline
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/60'
                        : isDegraded
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    }`}
                  >
                    {isOffline ? (
                      <WifiOff className="w-2.5 h-2.5" />
                    ) : (
                      <Wifi className="w-2.5 h-2.5" />
                    )}
                    <span>{sensor.status}</span>
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-1 text-[11px] font-mono">
                  <span className="text-slate-400 text-[10px]">Quality</span>
                  <span
                    className={`font-bold ${
                      isOffline
                        ? 'text-rose-400'
                        : isDegraded
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {sensor.dataQuality}%
                  </span>
                </div>

                <div className="w-full h-1 bg-[#142038] rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${
                      isOffline ? 'bg-rose-500' : isDegraded ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${sensor.dataQuality}%` }}
                  />
                </div>

                <div className="text-[9px] text-slate-400 truncate">
                  {sensor.aiSyntheticActive ? (
                    <span className="text-purple-300 font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> AI Fallback Active
                    </span>
                  ) : (
                    <span>Signal: {sensor.signalStatus}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
