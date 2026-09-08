import React from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Zap,
  Activity,
  ShieldCheck,
  Radio,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { SensorHealthItem } from '../../types/engine';

export const SensorHealthSection: React.FC = () => {
  const {
    sensors,
    sensorFaultMode,
    setSensorFaultMode,
    resetSensorsToNormal,
    isSensorFaultActive,
    sensorFaultNotification,
    status: engineStatus,
  } = useEngine();

  // Fleet data quality average
  const avgQuality = Math.round(
    sensors.reduce((acc, s) => acc + s.dataQuality, 0) / sensors.length
  );

  const onlineCount = sensors.filter((s) => s.status === 'ONLINE').length;
  const degradedCount = sensors.filter((s) => s.status === 'DEGRADED').length;
  const offlineCount = sensors.filter((s) => s.status === 'OFFLINE').length;

  return (
    <section className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 shadow-2xl font-mono text-xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2b48] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Sensor Health & Avionics Signal Bus Architecture
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#14223b] text-cyan-400 border border-cyan-700/50">
                8 CHANNELS MONITORED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              CAN 2.0B / ADC telemetry transducer signal integrity, packet loss rate, and synthetic AI fallback isolation
            </p>
          </div>
        </div>

        {/* Quick Fleet Health Metric & Reset Button */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
              Fleet Signal Quality
            </span>
            <span
              className={`font-black text-sm ${
                avgQuality >= 90
                  ? 'text-emerald-400'
                  : avgQuality >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {avgQuality}% Quality ({onlineCount}/8 Online)
            </span>
          </div>

          {isSensorFaultActive && (
            <button
              onClick={resetSensorsToNormal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-bold transition active:scale-95"
              title="Reset all sensors to nominal online state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sensors</span>
            </button>
          )}
        </div>
      </div>

      {/* CRITICAL DISTINCTION BANNER: ENGINE FAULT vs SENSOR FAULT */}
      {isSensorFaultActive && sensorFaultNotification ? (
        <div className="p-3.5 rounded-xl border bg-amber-950/30 border-amber-500/60 text-amber-200 shadow-lg space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce flex-shrink-0" />
              <div>
                <span className="font-extrabold uppercase tracking-wider text-xs block text-amber-300">
                  SENSOR FAULT DETECTED — ENGINE OPERATING NORMALLY
                </span>
                <span className="text-[11px] text-slate-200 font-semibold">
                  {sensorFaultNotification.issue} ({sensorFaultNotification.sensorName})
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-sm">
              ENGINE STATUS: 🟢 NORMAL
            </span>
          </div>

          <div className="text-[11px] leading-relaxed bg-[#0a1120]/80 p-2.5 rounded-lg border border-[#1b2b48] text-slate-300 space-y-1">
            <p>
              <strong className="text-cyan-400">Avionics Isolation:</strong>{' '}
              {sensorFaultNotification.engineImpact}
            </p>
            <p className="text-[10px] text-slate-400 italic">
              * The digital twin engine does not treat a failed or disconnected sensor as a propulsion mechanical failure.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-[#070d19] border border-[#16233a] flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 font-bold">
              ALL 8 AVIONICS SENSORS ONLINE
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Sensor Fault Isolation Active: Engine mechanical failure is strictly separated from telemetry transducer loss.
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold">
            0 SENSOR ANOMALIES
          </span>
        </div>
      )}

      {/* 8 SENSOR HEALTH CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sensors.map((sensor) => {
          const isOnline = sensor.status === 'ONLINE';
          const isDegraded = sensor.status === 'DEGRADED';
          const isOffline = sensor.status === 'OFFLINE';

          return (
            <div
              key={sensor.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all shadow-md relative overflow-hidden ${
                isOffline
                  ? 'bg-[#1a0f19] border-rose-500/70 shadow-[0_0_15px_rgba(255,23,68,0.15)] ring-1 ring-rose-500/30'
                  : isDegraded
                  ? 'bg-[#1b1510] border-amber-500/70 shadow-[0_0_12px_rgba(255,171,0,0.12)]'
                  : 'bg-[#070d19] border-[#182643] hover:border-[#24375b]'
              }`}
            >
              {/* Card Top: Name & Status Pill (ONLINE/OFFLINE/DEGRADED) */}
              <div>
                <div className="flex items-start justify-between gap-1.5 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs">{sensor.name}</h4>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                      {sensor.parameter}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isOffline
                        ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                        : isDegraded
                        ? 'bg-amber-950 text-amber-300 border border-amber-600'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    }`}
                  >
                    {isOffline ? (
                      <WifiOff className="w-3 h-3 text-rose-400" />
                    ) : isDegraded ? (
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Wifi className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>{sensor.status}</span>
                  </span>
                </div>

                {/* Data Quality Display (e.g. 99% quality, 72% quality, 0% quality) */}
                <div className="bg-[#0b1324] border border-[#16233a] p-2 rounded-lg mb-2.5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[10px] text-slate-400 uppercase">
                      Data Quality
                    </span>
                    <span
                      className={`text-lg font-black ${
                        isOffline
                          ? 'text-rose-400'
                          : isDegraded
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {sensor.dataQuality}%{' '}
                      <span className="text-[10px] font-normal text-slate-400">
                        quality
                      </span>
                    </span>
                  </div>

                  {/* Quality Progress bar */}
                  <div className="w-full h-1.5 bg-[#142038] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOffline
                          ? 'bg-rose-500'
                          : isDegraded
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${sensor.dataQuality}%` }}
                    />
                  </div>
                </div>

                {/* Signal Status & Last Update */}
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">Signal Status:</span>
                    <span
                      className={`font-semibold text-right leading-tight line-clamp-2 ${
                        isOffline
                          ? 'text-rose-300 font-bold'
                          : isDegraded
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {sensor.signalStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>Last Update:</span>
                    </span>
                    <span
                      className={`font-mono font-medium ${
                        isOffline ? 'text-rose-400 font-bold' : 'text-cyan-300'
                      }`}
                    >
                      {sensor.lastUpdate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Protocol & AI Synthetic Sensor State */}
              <div className="pt-2 mt-2.5 border-t border-[#16233a] flex items-center justify-between text-[9px]">
                <span className="text-slate-500">{sensor.busProtocol}</span>
                {sensor.aiSyntheticActive ? (
                  <span className="text-purple-300 font-bold flex items-center gap-1 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800">
                    <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                    <span>AI Synthetic Active</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">Hardware Stream</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
