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
  Wifi,
  WifiOff,
  Radio,
  AlertTriangle,
  Layers,
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
    isSensorFaultActive,
    status,
  } = useEngine();

  const [activeTab, setActiveTab] = useState<'all' | 'engine' | 'sensor'>('all');

  const engineSimulatorOptions: Array<{
    mode: FaultSimulationMode;
    label: string;
    icon: React.ElementType;
    desc: string;
    color: string;
    targetPreview: string;
  }> = [
    {
      mode: 'NORMAL',
      label: 'Normal Operation',
      icon: CheckCircle2,
      desc: 'All parameters within standard cruise envelope',
      color: 'border-emerald-500/50 hover:bg-emerald-950/40 text-emerald-300',
      targetPreview: 'CHT ~175°C | Oil 52 PSI',
    },
    {
      mode: 'HIGH_CHT',
      label: 'High CHT',
      icon: Flame,
      desc: 'Cylinder Head Temp ramps 175°C → 206°C',
      color: 'border-rose-500/50 hover:bg-rose-950/40 text-rose-300',
      targetPreview: 'CHT > 200°C (Thermal Stress)',
    },
    {
      mode: 'LOW_OIL_PRESS',
      label: 'Low Oil Pressure',
      icon: Droplets,
      desc: 'Scavenge pressure drops 52 → 24 PSI',
      color: 'border-amber-500/50 hover:bg-amber-950/40 text-amber-300',
      targetPreview: 'Oil Press < 30 PSI',
    },
    {
      mode: 'HIGH_OIL_TEMP',
      label: 'High Oil Temperature',
      icon: Thermometer,
      desc: 'Cooler degradation, oil temp 95°C → 126°C',
      color: 'border-orange-500/50 hover:bg-orange-950/40 text-orange-300',
      targetPreview: 'Oil Temp > 120°C',
    },
    {
      mode: 'ABNORMAL_VIBRATION',
      label: 'Abnormal Vibration',
      icon: Activity,
      desc: 'Bearing wear / imbalance, 0.8g → 3.8g',
      color: 'border-violet-500/50 hover:bg-violet-950/40 text-violet-300',
      targetPreview: 'Vibration > 3.5 g',
    },
    {
      mode: 'ABNORMAL_EGT',
      label: 'Abnormal EGT',
      icon: Zap,
      desc: 'Lean burn thermal excursion, 710°C → 840°C',
      color: 'border-yellow-500/50 hover:bg-yellow-950/40 text-yellow-300',
      targetPreview: 'EGT > 820°C',
    },
    {
      mode: 'RPM_INSTABILITY',
      label: 'RPM Instability',
      icon: Gauge,
      desc: 'ECU governor hunting / throttle fluctuation',
      color: 'border-cyan-500/50 hover:bg-cyan-950/40 text-cyan-300',
      targetPreview: 'RPM ±350 oscillation',
    },
    {
      mode: 'MULTIPLE_FAULT',
      label: 'Multiple Fault',
      icon: Zap,
      desc: 'Simultaneous CHT, Oil Pressure & Vibration failure',
      color: 'border-red-600/70 hover:bg-red-950/60 text-red-300',
      targetPreview: 'Cascading Critical Failure',
    },
  ];

  const sensorSimulatorOptions: Array<{
    mode: SensorFaultMode;
    label: string;
    icon: React.ElementType;
    desc: string;
    color: string;
    targetPreview: string;
  }> = [
    {
      mode: 'NONE',
      label: 'All Sensors Nominal',
      icon: CheckCircle2,
      desc: 'All 8 telemetry transducers healthy & online',
      color: 'border-emerald-500/50 hover:bg-emerald-950/40 text-emerald-300',
      targetPreview: '8/8 Online • 99% Quality',
    },
    {
      mode: 'CHT_SENSOR_OFFLINE',
      label: 'CHT Sensor Offline',
      icon: WifiOff,
      desc: 'Type-K thermocouple open-circuit disconnect',
      color: 'border-rose-500/50 hover:bg-rose-950/40 text-rose-300',
      targetPreview: 'OFFLINE • 0% Quality (Timeout)',
    },
    {
      mode: 'VIBRATION_SENSOR_DEGRADED',
      label: 'Vibration Degraded',
      icon: Radio,
      desc: 'Accelerometer cable EMI & packet CRC loss',
      color: 'border-amber-500/50 hover:bg-amber-950/40 text-amber-300',
      targetPreview: 'DEGRADED • 72% Quality',
    },
    {
      mode: 'FUEL_SENSOR_OFFLINE',
      label: 'Fuel Sensor Offline',
      icon: WifiOff,
      desc: 'Ultrasonic tank sender bus carrier timeout',
      color: 'border-purple-500/50 hover:bg-purple-950/40 text-purple-300',
      targetPreview: 'OFFLINE • 0% Quality',
    },
    {
      mode: 'OIL_PRESSURE_SENSOR_DRIFT',
      label: 'Oil Pressure Drift',
      icon: AlertTriangle,
      desc: 'Piezoresistive calibration bias offset',
      color: 'border-orange-500/50 hover:bg-orange-950/40 text-orange-300',
      targetPreview: 'DEGRADED • 64% Quality',
    },
  ];

  return (
    <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-lg p-3.5 shadow-xl font-mono">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#1b2b48] gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold tracking-wider text-slate-100 uppercase">
                HARDWARE-IN-THE-LOOP FAULT SIMULATOR
              </h2>
              <span className="px-1.5 py-0.2 text-[9px] rounded bg-slate-800 text-slate-300 border border-slate-700">
                HIL SIMULATOR BENCH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Inject engine mechanical failures or telemetry sensor loss to test digital twin fault isolation
            </p>
          </div>
        </div>

        {/* Status Indicators & Reset Actions */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">Active States</div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span
                className={
                  simulationMode === 'NORMAL'
                    ? 'text-emerald-400'
                    : simulationMode === 'MULTIPLE_FAULT'
                    ? 'text-red-400 animate-pulse'
                    : 'text-amber-400'
                }
              >
                ENG: {simulationMode.replace('_', ' ')}
              </span>
              <span className="text-slate-600">|</span>
              <span
                className={
                  sensorFaultMode === 'NONE'
                    ? 'text-emerald-400'
                    : sensorFaultMode.includes('OFFLINE')
                    ? 'text-rose-400 animate-pulse'
                    : 'text-amber-400'
                }
              >
                SENS: {sensorFaultMode === 'NONE' ? 'NOMINAL' : sensorFaultMode.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button
            onClick={resetToNormal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#131f38] hover:bg-[#1a2b4d] border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Distinction Directive Notice */}
      <div className="bg-[#070d19] border border-[#172640] px-3 py-1.5 rounded-md mb-3 flex items-center justify-between text-[10px] text-slate-300">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <strong className="text-cyan-300">ENGINE FAULT vs SENSOR FAULT DISTINCTION:</strong>
          <span>A sensor fault isolates the telemetry bus; the engine continues operating normally via AI synthetic reconstruction.</span>
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2 py-0.5 rounded text-[10px] ${
              activeTab === 'all' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`px-2 py-0.5 rounded text-[10px] ${
              activeTab === 'engine' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            Engine Faults
          </button>
          <button
            onClick={() => setActiveTab('sensor')}
            className={`px-2 py-0.5 rounded text-[10px] ${
              activeTab === 'sensor' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sensor Faults
          </button>
        </div>
      </div>

      {/* 1. ENGINE FAULTS ROW */}
      {(activeTab === 'all' || activeTab === 'engine') && (
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
            <span className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-cyan-400" />
              <span>Propulsion Engine Fault Modes (Mechanical & Thermal)</span>
            </span>
            <span className="text-slate-500">Alters engine physics & health</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {engineSimulatorOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = simulationMode === opt.mode;

              return (
                <button
                  key={opt.mode}
                  onClick={() => setSimulationMode(opt.mode)}
                  className={`p-2 rounded-md border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#182744] to-[#0f1b33] border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : `bg-[#0d162a]/90 ${opt.color} border-[#1a2a47]`
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400" />
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                      }`}
                    />
                  </div>

                  <div>
                    <div
                      className={`text-[10px] font-bold tracking-tight mb-0.5 ${
                        isSelected ? 'text-cyan-200' : 'text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </div>
                    <div className="text-[8px] text-slate-400 line-clamp-1 font-mono">
                      {opt.targetPreview}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SENSOR FAULTS ROW */}
      {(activeTab === 'all' || activeTab === 'sensor') && (
        <div className="space-y-1.5 pt-2 border-t border-[#14223a]">
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
            <span className="font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-purple-400" />
              <span>Simulated Sensor Fault Options (Avionics Signal Bus Failure)</span>
            </span>
            <span className="text-emerald-400 font-semibold">Engine remains mechanically NORMAL</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {sensorSimulatorOptions.map((sOpt) => {
              const Icon = sOpt.icon;
              const isSelected = sensorFaultMode === sOpt.mode;

              return (
                <button
                  key={sOpt.mode}
                  onClick={() => setSensorFaultMode(sOpt.mode)}
                  className={`p-2.5 rounded-md border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#211636] to-[#120c22] border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : `bg-[#0d162a]/90 ${sOpt.color} border-[#1a2a47]`
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400" />
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-purple-400 animate-ping' : 'bg-slate-700'
                      }`}
                    />
                  </div>

                  <div>
                    <div
                      className={`text-[11px] font-bold tracking-tight mb-0.5 ${
                        isSelected ? 'text-purple-200' : 'text-slate-200'
                      }`}
                    >
                      {sOpt.label}
                    </div>
                    <div className="text-[9px] text-slate-400 line-clamp-1 font-mono">
                      {sOpt.targetPreview}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
