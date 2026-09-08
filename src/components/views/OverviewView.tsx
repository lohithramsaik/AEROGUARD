import React from 'react';
import {
  Gauge,
  Flame,
  Zap,
  Thermometer,
  Droplets,
  Activity,
  Fuel,
  Compass,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';
import { MainStatusCard } from '../common/MainStatusCard';
import { EngineHealthGauge } from '../common/EngineHealthGauge';
import { ActiveFaultPanel } from '../common/ActiveFaultPanel';
import { LiveParameterCard, ParameterConfig } from '../common/LiveParameterCard';
import { LiveGraph } from '../common/LiveGraph';
import { SystemStatusPanel } from '../common/SystemStatusPanel';
import { FaultDetailModal } from '../faults/FaultDetailModal';
import { SensorHealthSection } from '../sensors/SensorHealthSection';

export const OverviewView: React.FC = () => {
  const { telemetry, simulationMode, selectedFault, setSelectedFault } = useEngine();

  // Map 8 required live parameters with operational limits
  const parameters: ParameterConfig[] = [
    {
      key: 'rpm',
      name: 'Engine RPM',
      value: telemetry.rpm,
      unit: 'RPM',
      normalRange: '2200–2600 RPM',
      minLimit: 1800,
      maxLimit: 3000,
      currentNum: telemetry.rpm,
      status: telemetry.rpm > 2750 || telemetry.rpm < 2000 ? 'CRITICAL' : telemetry.rpm > 2650 ? 'WARNING' : 'NORMAL',
      icon: Gauge,
    },
    {
      key: 'cht',
      name: 'CHT (Cylinder Head)',
      value: `${telemetry.cht}°C`,
      unit: '°C',
      normalRange: '150–190°C',
      minLimit: 120,
      maxLimit: 220,
      currentNum: telemetry.cht,
      status: telemetry.cht >= 195 ? 'CRITICAL' : telemetry.cht >= 186 ? 'WARNING' : 'NORMAL',
      icon: Flame,
    },
    {
      key: 'egt',
      name: 'EGT (Exhaust Gas)',
      value: `${telemetry.egt}°C`,
      unit: '°C',
      normalRange: '680–740°C',
      minLimit: 600,
      maxLimit: 880,
      currentNum: telemetry.egt,
      status: telemetry.egt >= 780 ? 'CRITICAL' : telemetry.egt >= 750 ? 'WARNING' : 'NORMAL',
      icon: Zap,
    },
    {
      key: 'oilTemp',
      name: 'Oil Temperature',
      value: `${telemetry.oilTemp}°C`,
      unit: '°C',
      normalRange: '80–105°C',
      minLimit: 60,
      maxLimit: 135,
      currentNum: telemetry.oilTemp,
      status: telemetry.oilTemp >= 115 ? 'CRITICAL' : telemetry.oilTemp >= 106 ? 'WARNING' : 'NORMAL',
      icon: Thermometer,
    },
    {
      key: 'oilPressure',
      name: 'Oil Pressure',
      value: `${telemetry.oilPressure} PSI`,
      unit: 'PSI',
      normalRange: '45–65 PSI',
      minLimit: 15,
      maxLimit: 80,
      currentNum: telemetry.oilPressure,
      status: telemetry.oilPressure <= 30 ? 'CRITICAL' : telemetry.oilPressure <= 42 ? 'WARNING' : 'NORMAL',
      icon: Droplets,
    },
    {
      key: 'vibration',
      name: 'Engine Vibration',
      value: `${telemetry.vibration} g`,
      unit: 'g',
      normalRange: '0.4–1.2 g',
      minLimit: 0,
      maxLimit: 5.0,
      currentNum: telemetry.vibration,
      status: telemetry.vibration >= 2.0 ? 'CRITICAL' : telemetry.vibration >= 1.4 ? 'WARNING' : 'NORMAL',
      icon: Activity,
    },
    {
      key: 'fuelFlow',
      name: 'Fuel Flow Rate',
      value: `${telemetry.fuelFlow} L/h`,
      unit: 'L/h',
      normalRange: '18–26 L/h',
      minLimit: 10,
      maxLimit: 36,
      currentNum: telemetry.fuelFlow,
      status: telemetry.fuelFlow >= 29 ? 'CRITICAL' : telemetry.fuelFlow >= 27 ? 'WARNING' : 'NORMAL',
      icon: Fuel,
    },
    {
      key: 'manifoldPressure',
      name: 'Manifold Pressure',
      value: `${telemetry.manifoldPressure} inHg`,
      unit: 'inHg',
      normalRange: '28–32 inHg',
      minLimit: 20,
      maxLimit: 40,
      currentNum: telemetry.manifoldPressure,
      status: telemetry.manifoldPressure >= 34.5 ? 'CRITICAL' : telemetry.manifoldPressure >= 33 ? 'WARNING' : 'NORMAL',
      icon: Compass,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 0. Hardware-in-the-loop Engine Fault Simulator Panel */}
      <FaultSimulatorPanel />

      {/* 1. Main Engine Status Card (The first question answered: Normal vs Fault) */}
      <MainStatusCard />

      {/* 2 & 3. Engine Health Gauge & Active Fault Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <EngineHealthGauge />
        </div>
        <div className="lg:col-span-7">
          <ActiveFaultPanel />
        </div>
      </div>

      {/* 4. Live Parameter Cards (8 core aero parameters) */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Live Telemetry Channels</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-sans">
            8 Monitored Sensors
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {parameters.map((param) => (
            <LiveParameterCard key={param.key} param={param} />
          ))}
        </div>
      </div>

      {/* 5. Dedicated Sensor Health & Avionics Signal Bus Architecture Section */}
      <SensorHealthSection />

      {/* 6 & 7. Live Graph & System Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <LiveGraph />
        </div>
        <div className="lg:col-span-4">
          <SystemStatusPanel />
        </div>
      </div>

      {/* Fault Detail Investigation Modal */}
      <FaultDetailModal fault={selectedFault} onClose={() => setSelectedFault(null)} />
    </div>
  );
};
