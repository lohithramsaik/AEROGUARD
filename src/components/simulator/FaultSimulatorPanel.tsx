import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Thermometer,
  Activity,
  Gauge,
  RotateCcw,
  Zap,
  Sliders,
  CheckCircle2,
  Cpu,
  Radio,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulationMode, SensorFaultMode } from '../../types/engine';

export const FaultSimulatorPanel: React.FC = () => {
  const {
    simulationMode,
    setSimulationMode,
    resetToNormal,
    sensorFaultMode,
    setSensorFaultMode,
    resetSensorsToNormal,
  } = useEngine();

  // Collapsed by default so dashboard content is front and center
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const quickEngineModes: Array<{
    mode: FaultSimulationMode;
    label: string;
    icon: React.ElementType;
    activeColor: string;
  }> = [
    { mode: 'NORMAL', label: 'Normal', icon: CheckCircle2, activeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60' },
    { mode: 'HIGH_CHT', label: 'High CHT', icon: Flame, activeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/60' },
    { mode: 'LOW_OIL_PRESS', label: 'Low Oil', icon: Droplets, activeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/60' },
    { mode: 'ABNORMAL_VIBRATION', label: 'Vibration', icon: Activity, activeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/60' },
    { mode: 'MULTIPLE_FAULT', label: 'Multi-Fault', icon: Zap, activeColor: 'bg-red-600/30 text-red-200 border-red-500 animate-pulse' },
  ];

  const otherEngineModes: Array<{
    mode: FaultSimulationMode;
    label: string;
    sublabel: string;
    icon: React.ElementType;
  }> = [
    { mode: 'HIGH_OIL_TEMP', label: 'High Oil Temp', sublabel: 'Oil Temp > 120°C', icon: Thermometer },
    { mode: 'ABNORMAL_EGT', label: 'Abnormal EGT', sublabel: 'Exhaust > 820°C', icon: Zap },
    { mode: 'RPM_INSTABILITY', label: 'RPM Oscillation', sublabel: 'Governor Hunting', icon: Gauge },
  ];

  const sensorModes: Array<{
    mode: SensorFaultMode;
    label: string;
    sublabel: string;
  }> = [
    { mode: 'NONE', label: 'All Sensors OK', sublabel: '8/8 Online' },
    { mode: 'CHT_SENSOR_OFFLINE', label: 'CHT Offline', sublabel: 'Thermocouple disconnect' },
    { mode: 'VIBRATION_SENSOR_DEGRADED', label: 'Vibration Degraded', sublabel: 'Cable signal noise' },
    { mode: 'FUEL_SENSOR_OFFLINE', label: 'Fuel Sensor Offline', sublabel: 'Bus timeout' },
    { mode: 'OIL_PRESSURE_SENSOR_DRIFT', label: 'Pressure Drift', sublabel: 'Calibration offset' },
  ];

  const handleResetAll = () => {
    resetToNormal();
    resetSensorsToNormal();
  };

  const isFaultActive = simulationMode !== 'NORMAL' || sensorFaultMode !== 'NONE';

  return (
    <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-2.5 shadow-lg font-sans transition-all">
      {/* Compact Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Simulator Identity & Current Mode */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#101b31] border border-[#21355a] text-cyan-400 font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] tracking-wide">FAULT SIMULATOR</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400">Mode:</span>
            <span
              className={`font-bold ${
                simulationMode === 'NORMAL'
                  ? 'text-emerald-400'
                  : simulationMode === 'MULTIPLE_FAULT'
                  ? 'text-rose-400 animate-pulse'
                  : 'text-amber-400'
              }`}
            >
              {simulationMode.replace('_', ' ')}
            </span>
            {sensorFaultMode !== 'NONE' && (
              <span className="text-purple-400 font-bold ml-1">
                + SENS: {sensorFaultMode.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Center: Quick Clickable Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quickEngineModes.map((opt) => {
            const Icon = opt.icon;
            const isSelected = simulationMode === opt.mode;

            return (
              <button
                key={opt.mode}
                onClick={() => setSimulationMode(opt.mode)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition border ${
                  isSelected
                    ? opt.activeColor
                    : 'bg-[#0f192c] text-slate-300 border-[#1e2f50] hover:text-white hover:bg-[#162542]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Reset & Expand Toggle */}
        <div className="flex items-center space-x-2">
          {isFaultActive && (
            <button
              onClick={handleResetAll}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 text-[11px] font-semibold transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#101b31] hover:bg-[#172747] border border-[#21355a] text-slate-300 hover:text-white text-[11px] font-medium transition"
          >
            <span>{isExpanded ? 'Fewer Options' : 'More Options'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expandable Advanced Modes (Shown when user clicks "More Options") */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#182643] space-y-3 animate-fadeIn text-xs">
          {/* Secondary Engine Modes */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Flame className="w-3 h-3 text-cyan-400" />
              <span>Additional Engine Mechanical / Thermal Excursions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {otherEngineModes.map((opt) => {
                const Icon = opt.icon;
                const isSelected = simulationMode === opt.mode;

                return (
                  <button
                    key={opt.mode}
                    onClick={() => setSimulationMode(opt.mode)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                        : 'bg-[#0e1628] border-[#1b2b48] text-slate-300 hover:bg-[#13203a] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-semibold text-xs">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{opt.sublabel}</div>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensor Signal Modes */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-purple-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-purple-400" />
                <span>Sensor Bus Faults (Engine Remains Mechanically Healthy)</span>
              </span>
              <span className="text-slate-400 text-[9px]">Tests AI sensor failure isolation</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {sensorModes.map((s) => {
                const isSelected = sensorFaultMode === s.mode;
                return (
                  <button
                    key={s.mode}
                    onClick={() => setSensorFaultMode(s.mode)}
                    className={`p-2 rounded-lg border text-left transition ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-400 text-purple-200'
                        : 'bg-[#0e1628] border-[#1b2b48] text-slate-300 hover:bg-[#13203a] hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs truncate">{s.label}</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">{s.sublabel}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
