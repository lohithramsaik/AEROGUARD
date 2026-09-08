import React from 'react';
import {
  Gauge,
  Activity,
  Flame,
  Droplets,
  Fuel,
  Compass,
  Zap,
  Thermometer,
  Wind,
  Layers,
  RotateCw,
  Clock,
  Radio,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';
import { LiveParameterTile } from '../monitoring/LiveParameterTile';
import { MultiParameterLiveGraph } from '../monitoring/MultiParameterLiveGraph';
import { SensorHealthSection } from '../sensors/SensorHealthSection';
import { LiveMetricItem } from '../../types/engine';

export const LiveMonitoringView: React.FC = () => {
  const { telemetry, simulationMode } = useEngine();

  // 1. Engine Parameters
  const engineParameters: LiveMetricItem[] = [
    {
      id: 'rpm',
      name: 'Engine RPM',
      category: 'ENGINE',
      unit: 'RPM',
      measured: telemetry.rpm,
      expected: 2450,
      aiEstimate: simulationMode === 'RPM_INSTABILITY' ? 2465 : telemetry.rpm,
      expectedRange: '2200–2600 RPM',
      status: telemetry.rpm > 2750 || telemetry.rpm < 2000 ? 'CRITICAL' : telemetry.rpm > 2650 ? 'WARNING' : 'NORMAL',
      trend: simulationMode === 'RPM_INSTABILITY' ? 'RISING' : 'STEADY',
      trendRate: '±12 RPM/s',
      delta: `${telemetry.rpm >= 2450 ? '+' : ''}${telemetry.rpm - 2450} RPM`,
    },
    {
      id: 'engineLoad',
      name: 'Engine Load',
      category: 'ENGINE',
      unit: '%',
      measured: telemetry.engineLoad,
      expected: 68.0,
      aiEstimate: (telemetry.engineLoad * 0.99).toFixed(1),
      expectedRange: '50.0–80.0%',
      status: telemetry.engineLoad > 85.0 ? 'CRITICAL' : telemetry.engineLoad > 78.0 ? 'WARNING' : 'NORMAL',
      trend: telemetry.engineLoad > 75 ? 'RISING' : 'STEADY',
      trendRate: '+0.4%/s',
      delta: `${telemetry.engineLoad >= 68.0 ? '+' : ''}${(telemetry.engineLoad - 68.0).toFixed(1)}%`,
    },
    {
      id: 'manifoldPressure',
      name: 'Manifold Pressure (MAP)',
      category: 'ENGINE',
      unit: 'inHg',
      measured: telemetry.manifoldPressure,
      expected: 29.8,
      aiEstimate: (telemetry.manifoldPressure * 0.995).toFixed(1),
      expectedRange: '28.0–32.0 inHg',
      status: telemetry.manifoldPressure >= 34.5 ? 'CRITICAL' : telemetry.manifoldPressure >= 33.0 ? 'WARNING' : 'NORMAL',
      trend: telemetry.manifoldPressure > 32 ? 'RISING' : 'STEADY',
      trendRate: '+0.1 inHg/s',
      delta: `${telemetry.manifoldPressure >= 29.8 ? '+' : ''}${(telemetry.manifoldPressure - 29.8).toFixed(1)} inHg`,
    },
    {
      id: 'throttlePosition',
      name: 'Throttle Position (TPS)',
      category: 'ENGINE',
      unit: '%',
      measured: telemetry.throttlePosition,
      expected: 64.0,
      aiEstimate: 64.2,
      expectedRange: '0.0–100.0%',
      status: 'NORMAL',
      trend: 'STEADY',
      trendRate: '0.0%/s',
      delta: `${telemetry.throttlePosition >= 64.0 ? '+' : ''}${(telemetry.throttlePosition - 64.0).toFixed(1)}%`,
    },
    {
      id: 'engineRuntime',
      name: 'Engine Total Runtime',
      category: 'ENGINE',
      unit: 'HRS',
      measured: telemetry.engineRuntime,
      expected: '142h 38m',
      aiEstimate: '142h 38m',
      expectedRange: '0–2000h (TBO)',
      status: 'NORMAL',
      trend: 'STEADY',
      trendRate: '+1s/s',
      delta: '0.0h',
    },
  ];

  // 2. Temperature Parameters
  const temperatureParameters: LiveMetricItem[] = [
    {
      id: 'cht',
      name: 'Cylinder Head Temp (CHT)',
      category: 'TEMPERATURE',
      unit: '°C',
      measured: telemetry.cht,
      expected: 170.0,
      aiEstimate: simulationMode === 'HIGH_CHT' ? 173.5 : telemetry.cht,
      expectedRange: '150–190°C',
      status: telemetry.cht >= 195 ? 'CRITICAL' : telemetry.cht >= 186 ? 'WARNING' : 'NORMAL',
      trend: telemetry.cht > 185 ? 'RISING' : 'STEADY',
      trendRate: '+1.4°C/min',
      delta: `${telemetry.cht >= 170 ? '+' : ''}${(telemetry.cht - 170).toFixed(1)}°C`,
    },
    {
      id: 'egt',
      name: 'Exhaust Gas Temp (EGT)',
      category: 'TEMPERATURE',
      unit: '°C',
      measured: telemetry.egt,
      expected: 710,
      aiEstimate: simulationMode === 'ABNORMAL_EGT' ? 718 : telemetry.egt,
      expectedRange: '680–740°C',
      status: telemetry.egt >= 780 ? 'CRITICAL' : telemetry.egt >= 750 ? 'WARNING' : 'NORMAL',
      trend: telemetry.egt > 740 ? 'RISING' : 'STEADY',
      trendRate: '+3.2°C/min',
      delta: `${telemetry.egt >= 710 ? '+' : ''}${telemetry.egt - 710}°C`,
    },
    {
      id: 'oilTemp',
      name: 'Oil Temperature',
      category: 'TEMPERATURE',
      unit: '°C',
      measured: telemetry.oilTemp,
      expected: 95.0,
      aiEstimate: simulationMode === 'HIGH_OIL_TEMP' ? 96.5 : telemetry.oilTemp,
      expectedRange: '80–105°C',
      status: telemetry.oilTemp >= 115 ? 'CRITICAL' : telemetry.oilTemp >= 106 ? 'WARNING' : 'NORMAL',
      trend: telemetry.oilTemp > 105 ? 'RISING' : 'STEADY',
      trendRate: '+0.8°C/min',
      delta: `${telemetry.oilTemp >= 95 ? '+' : ''}${(telemetry.oilTemp - 95).toFixed(1)}°C`,
    },
    {
      id: 'ambientTemp',
      name: 'Ambient Temperature (OAT)',
      category: 'TEMPERATURE',
      unit: '°C',
      measured: telemetry.ambientTemp,
      expected: 18.0,
      aiEstimate: 18.4,
      expectedRange: '-20–45°C',
      status: 'NORMAL',
      trend: 'STEADY',
      trendRate: '0.0°C/min',
      delta: '+0.4°C',
    },
  ];

  // 3. Pressure Parameters
  const pressureParameters: LiveMetricItem[] = [
    {
      id: 'oilPressure',
      name: 'Engine Oil Pressure',
      category: 'PRESSURE',
      unit: 'PSI',
      measured: telemetry.oilPressure,
      expected: 52.0,
      aiEstimate: simulationMode === 'LOW_OIL_PRESS' ? 51.5 : telemetry.oilPressure,
      expectedRange: '45–65 PSI',
      status: telemetry.oilPressure <= 30 ? 'CRITICAL' : telemetry.oilPressure <= 42 ? 'WARNING' : 'NORMAL',
      trend: telemetry.oilPressure < 45 ? 'FALLING' : 'STEADY',
      trendRate: '-1.8 PSI/min',
      delta: `${(telemetry.oilPressure - 52.0).toFixed(1)} PSI`,
    },
    {
      id: 'fuelPressure',
      name: 'Fuel Rail Pressure',
      category: 'PRESSURE',
      unit: 'PSI',
      measured: telemetry.fuelPressure,
      expected: 43.5,
      aiEstimate: 43.5,
      expectedRange: '40.0–48.0 PSI',
      status: 'NORMAL',
      trend: 'STEADY',
      trendRate: '0.0 PSI/s',
      delta: `${telemetry.fuelPressure >= 43.5 ? '+' : ''}${(telemetry.fuelPressure - 43.5).toFixed(1)} PSI`,
    },
    {
      id: 'manifoldPressure2',
      name: 'Manifold Pressure (MAP)',
      category: 'PRESSURE',
      unit: 'inHg',
      measured: telemetry.manifoldPressure,
      expected: 29.8,
      aiEstimate: 29.8,
      expectedRange: '28.0–32.0 inHg',
      status: telemetry.manifoldPressure >= 34.5 ? 'CRITICAL' : telemetry.manifoldPressure >= 33.0 ? 'WARNING' : 'NORMAL',
      trend: 'STEADY',
      trendRate: '0.0 inHg/s',
      delta: `${(telemetry.manifoldPressure - 29.8).toFixed(1)} inHg`,
    },
    {
      id: 'ambientPressure',
      name: 'Ambient Baro Pressure',
      category: 'PRESSURE',
      unit: 'inHg',
      measured: telemetry.ambientPressure,
      expected: 24.8,
      aiEstimate: 24.8,
      expectedRange: '20.0–30.0 inHg',
      status: 'NORMAL',
      trend: 'STEADY',
      trendRate: '0.0 inHg/min',
      delta: '0.0 inHg (5,000 FT)',
    },
  ];

  // 4. Fuel Parameters
  const fuelParameters: LiveMetricItem[] = [
    {
      id: 'fuelFlow',
      name: 'Fuel Flow Rate',
      category: 'FUEL',
      unit: 'L/h',
      measured: telemetry.fuelFlow,
      expected: 22.4,
      aiEstimate: 22.5,
      expectedRange: '18.0–26.0 L/h',
      status: telemetry.fuelFlow >= 29 ? 'CRITICAL' : telemetry.fuelFlow >= 27 ? 'WARNING' : 'NORMAL',
      trend: telemetry.fuelFlow > 26 ? 'RISING' : 'STEADY',
      trendRate: '+0.2 L/h',
      delta: `${(telemetry.fuelFlow - 22.4).toFixed(1)} L/h`,
    },
    {
      id: 'fuelLevel',
      name: 'Fuel Tank Level',
      category: 'FUEL',
      unit: '%',
      measured: telemetry.fuelLevel,
      expected: 74.0,
      aiEstimate: telemetry.fuelLevel,
      expectedRange: '15.0–100.0%',
      status: telemetry.fuelLevel < 20 ? 'WARNING' : 'NORMAL',
      trend: 'FALLING',
      trendRate: '-0.3%/min',
      delta: `${(telemetry.fuelLevel - 74.0).toFixed(1)}%`,
    },
    {
      id: 'fuelRemaining',
      name: 'Estimated Fuel Remaining',
      category: 'FUEL',
      unit: 'L',
      measured: telemetry.fuelRemaining,
      expected: 59.2,
      aiEstimate: telemetry.fuelRemaining,
      expectedRange: '10.0–80.0 L',
      status: telemetry.fuelRemaining < 15 ? 'WARNING' : 'NORMAL',
      trend: 'FALLING',
      trendRate: '-0.37 L/min',
      delta: `${(telemetry.fuelRemaining - 59.2).toFixed(1)} L`,
    },
    {
      id: 'fuelConsumption',
      name: 'Mission Fuel Consumption',
      category: 'FUEL',
      unit: 'L',
      measured: telemetry.fuelConsumption,
      expected: 18.6,
      aiEstimate: telemetry.fuelConsumption,
      expectedRange: '0.0–80.0 L',
      status: 'NORMAL',
      trend: 'RISING',
      trendRate: '+0.37 L/min',
      delta: `${(telemetry.fuelConsumption - 18.6).toFixed(1)} L`,
    },
  ];

  // 5. Mechanical Parameters
  const mechanicalParameters: LiveMetricItem[] = [
    {
      id: 'vibration',
      name: 'Engine Vibration (Tri-Axial)',
      category: 'MECHANICAL',
      unit: 'g',
      measured: telemetry.vibration,
      expected: 0.80,
      aiEstimate: simulationMode === 'ABNORMAL_VIBRATION' ? 0.85 : telemetry.vibration,
      expectedRange: '0.40–1.20 g',
      status: telemetry.vibration >= 2.0 ? 'CRITICAL' : telemetry.vibration >= 1.4 ? 'WARNING' : 'NORMAL',
      trend: telemetry.vibration > 1.4 ? 'RISING' : 'STEADY',
      trendRate: '+0.4 g/s',
      delta: `${(telemetry.vibration - 0.80).toFixed(2)} g`,
    },
    {
      id: 'engineTorque',
      name: 'Brake Engine Torque',
      category: 'MECHANICAL',
      unit: 'Nm',
      measured: telemetry.engineTorque,
      expected: 242,
      aiEstimate: 241,
      expectedRange: '180–280 Nm',
      status: 'NORMAL',
      trend: 'STEADY',
      trendRate: '0.0 Nm/s',
      delta: `${telemetry.engineTorque >= 242 ? '+' : ''}${telemetry.engineTorque - 242} Nm`,
    },
    {
      id: 'propellerRpm',
      name: 'Propeller Shaft RPM',
      category: 'MECHANICAL',
      unit: 'RPM',
      measured: telemetry.propellerRpm,
      expected: 1008,
      aiEstimate: 1008,
      expectedRange: '900–1080 RPM',
      status: 'NORMAL',
      trend: 'STEADY',
      trendRate: '0.0 RPM/s',
      delta: `${telemetry.propellerRpm >= 1008 ? '+' : ''}${telemetry.propellerRpm - 1008} RPM`,
    },
  ];

  return (
    <div className="space-y-5">
      {/* 0. Interactive Fault Simulator Panel */}
      <FaultSimulatorPanel />

      {/* Top Banner: Real-Time Distinction Header */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                Comprehensive Live Telemetry Bus & Sensor Suite
              </h2>
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                50 Hz DUAL STREAM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Multi-channel avionics telemetry cross-referenced against expected thermodynamic baseline and AI neural twin estimate.
            </p>
          </div>
        </div>

        {/* Legend pills clearly distinguishing 3 modalities */}
        <div className="flex items-center space-x-2 text-[10px]">
          <div className="px-2.5 py-1 rounded bg-[#09101f] border border-cyan-500/50 text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <strong>MEASURED / SIMULATED</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#0e172a] border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-0.5 border-t border-dashed border-amber-400"></span>
            <strong>EXPECTED BASELINE</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#0e172a] border border-purple-500/40 text-purple-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <strong>AI ESTIMATE</strong>
          </div>
        </div>
      </div>

      {/* SECTION 1: Engine Parameters */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1 border-b border-[#1b2b48] pb-1.5">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>1. Engine Parameters</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            5 CHANNELS • ROTAX 916iSc CORE
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {engineParameters.map((metric) => (
            <LiveParameterTile key={metric.id} metric={metric} icon={Gauge} />
          ))}
        </div>
      </section>

      {/* SECTION 2: Temperature */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1 border-b border-[#1b2b48] pb-1.5">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-400" />
            <span>2. Temperature Sensors</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            4 CHANNELS • THERMOCOUPLE & RTD
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {temperatureParameters.map((metric) => (
            <LiveParameterTile key={metric.id} metric={metric} icon={Flame} />
          ))}
        </div>
      </section>

      {/* SECTION 3: Pressure */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1 border-b border-[#1b2b48] pb-1.5">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>3. Pressure Transducers</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            4 CHANNELS • PIEZORESISTIVE TRANSDUCERS
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {pressureParameters.map((metric) => (
            <LiveParameterTile key={metric.id} metric={metric} icon={Droplets} />
          ))}
        </div>
      </section>

      {/* SECTION 4: Fuel */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1 border-b border-[#1b2b48] pb-1.5">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-400" />
            <span>4. Fuel System & Quantity</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            4 CHANNELS • CAPACITIVE LEVEL & FLOW METER
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {fuelParameters.map((metric) => (
            <LiveParameterTile key={metric.id} metric={metric} icon={Fuel} />
          ))}
        </div>
      </section>

      {/* SECTION 5: Mechanical */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1 border-b border-[#1b2b48] pb-1.5">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-purple-400" />
            <span>5. Mechanical & Dynamics</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            3 CHANNELS • ACCELEROMETER & REDUCTION GEARBOX
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mechanicalParameters.map((metric) => (
            <LiveParameterTile key={metric.id} metric={metric} icon={RotateCw} />
          ))}
        </div>
      </section>

      {/* SENSOR HEALTH & SIGNAL INTEGRITY ARCHITECTURE */}
      <SensorHealthSection />

      {/* LARGE REAL-TIME MULTI-PARAMETER COMPARISON GRAPH */}
      <section className="pt-2">
        <MultiParameterLiveGraph />
      </section>
    </div>
  );
};
