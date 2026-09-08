import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  Wrench,
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
  Info,
  Layers,
  Flame,
  Droplets,
  Fuel,
  Zap,
  Gauge,
  Calendar,
  Compass,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';

// Degradation status indicators requested by the user
export type DegradationStatus = 'Degradation detected' | 'Stable' | 'Improving';

export interface SystemHealthData {
  id: string;
  name: string;
  category: string;
  currentHealth: number;
  healthTrend: string;
  trendDirection: 'improving' | 'stable' | 'degrading';
  trendRate: string;
  degradationStatus: DegradationStatus;
  aiEstimate: number;
  aiDelta: string;
  aiConfidence: number;
  rulHours: number; // Estimated Remaining Useful Life in operating hours
  nominalTboHours: number;
  progressionSteps: { hour: string; health: number }[];
  primarySensors: { name: string; value: string; expected: string; status: 'nominal' | 'stress' }[];
  maintenanceAction: string;
  icon: React.ElementType;
  themeColor: string;
}

export const PredictiveMaintenanceView: React.FC = () => {
  const { telemetry, history, simulationMode, subsystemHealthList } = useEngine();
  const [selectedSystemId, setSelectedSystemId] = useState<string>('cylinder');

  // Examine historical sensor behavior for recent anomalies/fault excursions (last 30 samples)
  const recentHistory = useMemo(() => {
    return (history || []).slice(-30);
  }, [history]);

  const recentChtStress = useMemo(() => {
    return recentHistory.some((h) => h.cht >= 185);
  }, [recentHistory]);

  const recentOilPStress = useMemo(() => {
    return recentHistory.some((h) => h.oilPressure <= 42);
  }, [recentHistory]);

  const recentOilTStress = useMemo(() => {
    return recentHistory.some((h) => h.oilTemp >= 106);
  }, [recentHistory]);

  const recentVibStress = useMemo(() => {
    return recentHistory.some((h) => h.vibration >= 1.4);
  }, [recentHistory]);

  const recentEgtStress = useMemo(() => {
    return recentHistory.some((h) => h.egt >= 750);
  }, [recentHistory]);

  // Compute deterministic degradation metrics for all 5 core systems
  const systems: SystemHealthData[] = useMemo(() => {
    const cylSub = subsystemHealthList.find((s) => s.id === 'cylinder');
    const coolSub = subsystemHealthList.find((s) => s.id === 'cooling');
    const lubSub = subsystemHealthList.find((s) => s.id === 'lubrication');
    const mechSub = subsystemHealthList.find((s) => s.id === 'mechanical');
    const fuelSub = subsystemHealthList.find((s) => s.id === 'fuel');

    // -------------------------------------------------------------------------
    // 1. CYLINDER SYSTEM
    // -------------------------------------------------------------------------
    let cylHealth = cylSub ? cylSub.healthPercent : 91;
    let cylStatus: DegradationStatus = (cylSub?.degradationStatus as DegradationStatus) || 'Stable';
    let cylTrendDirection: 'improving' | 'stable' | 'degrading' = cylStatus === 'Degradation detected' ? 'degrading' : cylStatus === 'Improving' ? 'improving' : 'stable';
    let cylTrendText = cylSub?.trendRate ? `Thermal Stress (${cylSub.trendRate})` : 'Normal Wear (-0.05%/hr)';
    let cylRul = cylSub ? cylSub.rulHours : 820;

    if (telemetry.cht >= 195 || simulationMode === 'HIGH_CHT') {
      cylHealth = cylSub ? cylSub.healthPercent : Math.max(25, Math.round(91 - (telemetry.cht - 175) * 1.5));
      cylStatus = 'Degradation detected';
      cylTrendDirection = 'degrading';
      cylTrendText = 'Accelerated Thermal Stress (-3.4%/hr)';
      cylRul = cylSub ? cylSub.rulHours : 42;
    } else if (telemetry.cht >= 185) {
      cylHealth = cylSub ? cylSub.healthPercent : 72;
      cylStatus = 'Degradation detected';
      cylTrendDirection = 'degrading';
      cylTrendText = 'Thermal Excursion (-1.8%/hr)';
      cylRul = cylSub ? cylSub.rulHours : 140;
    } else if (simulationMode === 'MULTIPLE_FAULT') {
      cylHealth = 34;
      cylStatus = 'Degradation detected';
      cylTrendDirection = 'degrading';
      cylTrendText = 'Multiple Cascade (-5.2%/hr)';
      cylRul = 18;
    } else if (simulationMode === 'NORMAL' && recentChtStress) {
      cylHealth = 88;
      cylStatus = 'Improving';
      cylTrendDirection = 'improving';
      cylTrendText = 'Thermal Recovery (+0.8%/hr)';
      cylRul = 780;
    }

    const cylAi = Number((cylHealth + (cylStatus === 'Degradation detected' ? 1.5 : 0.8)).toFixed(1));
    const cylSteps = [
      { hour: '0h', health: 100 },
      { hour: '35h', health: 96 },
      { hour: '70h', health: 93 },
      { hour: '105h', health: 90 },
      { hour: '142h (Now)', health: cylHealth },
    ];

    // -------------------------------------------------------------------------
    // 2. COOLING SYSTEM
    // -------------------------------------------------------------------------
    let coolHealth = 87;
    let coolStatus: DegradationStatus = 'Stable';
    let coolTrendDirection: 'improving' | 'stable' | 'degrading' = 'stable';
    let coolTrendText = 'Nominal Heat Dissipation (-0.04%/hr)';
    let coolRul = 960;

    if (telemetry.cht >= 195 || simulationMode === 'HIGH_CHT') {
      coolHealth = 42;
      coolStatus = 'Degradation detected';
      coolTrendDirection = 'degrading';
      coolTrendText = 'Radiator Thermal Overload (-3.8%/hr)';
      coolRul = 56;
    } else if (telemetry.oilTemp >= 110 || simulationMode === 'HIGH_OIL_TEMP') {
      coolHealth = 54;
      coolStatus = 'Degradation detected';
      coolTrendDirection = 'degrading';
      coolTrendText = 'Oil Cooler Heat Saturation (-2.2%/hr)';
      coolRul = 98;
    } else if (simulationMode === 'MULTIPLE_FAULT') {
      coolHealth = 28;
      coolStatus = 'Degradation detected';
      coolTrendDirection = 'degrading';
      coolTrendText = 'Coolant Boiloff Hazard (-6.0%/hr)';
      coolRul = 15;
    } else if (simulationMode === 'NORMAL' && (recentChtStress || recentOilTStress)) {
      coolHealth = 84;
      coolStatus = 'Improving';
      coolTrendDirection = 'improving';
      coolTrendText = 'Bypass Flow Normalized (+1.1%/hr)';
      coolRul = 910;
    }

    const coolAi = Number((coolHealth - 0.9).toFixed(1));
    const coolSteps = [
      { hour: '0h', health: 100 },
      { hour: '35h', health: 95 },
      { hour: '70h', health: 91 },
      { hour: '105h', health: 87 },
      { hour: '142h (Now)', health: coolHealth },
    ];

    // -------------------------------------------------------------------------
    // 3. LUBRICATION SYSTEM
    // -------------------------------------------------------------------------
    let lubHealth = 94;
    let lubStatus: DegradationStatus = 'Stable';
    let lubTrendDirection: 'improving' | 'stable' | 'degrading' = 'stable';
    let lubTrendText = 'Hydrodynamic Wedge Stable (-0.06%/hr)';
    let lubRul = 640;

    if (telemetry.oilPressure <= 30 || simulationMode === 'LOW_OIL_PRESS') {
      lubHealth = 24;
      lubStatus = 'Degradation detected';
      lubTrendDirection = 'degrading';
      lubTrendText = 'Boundary Friction Starvation (-6.8%/hr)';
      lubRul = 14; // Immediate grounding warning
    } else if (telemetry.oilPressure <= 42) {
      lubHealth = 58;
      lubStatus = 'Degradation detected';
      lubTrendDirection = 'degrading';
      lubTrendText = 'Scavenge Loss (-2.9%/hr)';
      lubRul = 85;
    } else if (telemetry.oilTemp >= 115 || simulationMode === 'HIGH_OIL_TEMP') {
      lubHealth = 56;
      lubStatus = 'Degradation detected';
      lubTrendDirection = 'degrading';
      lubTrendText = 'Viscosity Thermal Breakdown (-2.5%/hr)';
      lubRul = 72;
    } else if (simulationMode === 'MULTIPLE_FAULT') {
      lubHealth = 22;
      lubStatus = 'Degradation detected';
      lubTrendDirection = 'degrading';
      lubTrendText = 'Catastrophic Oil Starvation (-7.5%/hr)';
      lubRul = 12;
    } else if (simulationMode === 'NORMAL' && (recentOilPStress || recentOilTStress)) {
      lubHealth = 89;
      lubStatus = 'Improving';
      lubTrendDirection = 'improving';
      lubTrendText = 'Pressure Re-Established (+1.5%/hr)';
      lubRul = 580;
    }

    const lubAi = Number((lubHealth - 0.8).toFixed(1));
    const lubSteps = [
      { hour: '0h', health: 100 },
      { hour: '35h', health: 97 },
      { hour: '70h', health: 94 },
      { hour: '105h', health: 91 },
      { hour: '142h (Now)', health: lubHealth },
    ];

    // -------------------------------------------------------------------------
    // 4. MECHANICAL SYSTEM
    // -------------------------------------------------------------------------
    let mechHealth = 91;
    let mechStatus: DegradationStatus = 'Stable';
    let mechTrendDirection: 'improving' | 'stable' | 'degrading' = 'stable';
    let mechTrendText = 'Vibration Dynamic Damping (-0.03%/hr)';
    let mechRul = 1380;

    if (telemetry.vibration >= 2.0 || simulationMode === 'ABNORMAL_VIBRATION') {
      mechHealth = 32;
      mechStatus = 'Degradation detected';
      mechTrendDirection = 'degrading';
      mechTrendText = 'Accelerated Bearing Flaking (-5.1%/hr)';
      mechRul = 28;
    } else if (telemetry.vibration >= 1.3) {
      mechHealth = 65;
      mechStatus = 'Degradation detected';
      mechTrendDirection = 'degrading';
      mechTrendText = 'Harmonic Resonant Load (-2.1%/hr)';
      mechRul = 180;
    } else if (simulationMode === 'RPM_INSTABILITY') {
      mechHealth = 64;
      mechStatus = 'Degradation detected';
      mechTrendDirection = 'degrading';
      mechTrendText = 'Governor Backlash Hunting (-2.4%/hr)';
      mechRul = 120;
    } else if (simulationMode === 'MULTIPLE_FAULT') {
      mechHealth = 26;
      mechStatus = 'Degradation detected';
      mechTrendDirection = 'degrading';
      mechTrendText = 'Severe Multi-Harmonic Imbalance (-6.5%/hr)';
      mechRul = 16;
    } else if (simulationMode === 'NORMAL' && recentVibStress) {
      mechHealth = 88;
      mechStatus = 'Improving';
      mechTrendDirection = 'improving';
      mechTrendText = 'Vibration Damped Nominal (+0.9%/hr)';
      mechRul = 1280;
    }

    const mechAi = Number((mechHealth + 0.6).toFixed(1));
    const mechSteps = [
      { hour: '0h', health: 100 },
      { hour: '35h', health: 96 },
      { hour: '70h', health: 92 },
      { hour: '105h', health: 89 },
      { hour: '142h (Now)', health: mechHealth },
    ];

    // -------------------------------------------------------------------------
    // 5. FUEL SYSTEM
    // -------------------------------------------------------------------------
    let fuelHealth = 95;
    let fuelStatus: DegradationStatus = 'Stable';
    let fuelTrendDirection: 'improving' | 'stable' | 'degrading' = 'stable';
    let fuelTrendText = 'Metering Calibration Nominal (-0.04%/hr)';
    let fuelRul = 840;

    if (telemetry.egt >= 780 || simulationMode === 'ABNORMAL_EGT') {
      fuelHealth = 46;
      fuelStatus = 'Degradation detected';
      fuelTrendDirection = 'degrading';
      fuelTrendText = 'Injector Thermal Coking / Lean Run (-3.1%/hr)';
      fuelRul = 68;
    } else if (telemetry.egt >= 750) {
      fuelHealth = 70;
      fuelStatus = 'Degradation detected';
      fuelTrendDirection = 'degrading';
      fuelTrendText = 'Lean Mixture Excursion (-1.6%/hr)';
      fuelRul = 220;
    } else if (simulationMode === 'MULTIPLE_FAULT') {
      fuelHealth = 38;
      fuelStatus = 'Degradation detected';
      fuelTrendDirection = 'degrading';
      fuelTrendText = 'Delivery Rail Pressure Drop (-4.8%/hr)';
      fuelRul = 24;
    } else if (simulationMode === 'NORMAL' && recentEgtStress) {
      fuelHealth = 91;
      fuelStatus = 'Improving';
      fuelTrendDirection = 'improving';
      fuelTrendText = 'Mixture Enriched & Stabilized (+0.7%/hr)';
      fuelRul = 790;
    }

    const fuelAi = Number((fuelHealth - 0.4).toFixed(1));
    const fuelSteps = [
      { hour: '0h', health: 100 },
      { hour: '35h', health: 98 },
      { hour: '70h', health: 95 },
      { hour: '105h', health: 92 },
      { hour: '142h (Now)', health: fuelHealth },
    ];

    return [
      {
        id: 'cylinder',
        name: 'Cylinder System',
        category: 'Thermal & Combustion Chamber',
        currentHealth: cylHealth,
        healthTrend: cylTrendText,
        trendDirection: cylTrendDirection,
        trendRate: cylStatus === 'Degradation detected' ? '-3.4%/hr' : '-0.05%/hr',
        degradationStatus: cylStatus,
        aiEstimate: cylAi,
        aiDelta: `Δ ${(cylAi - cylHealth).toFixed(1)}%`,
        aiConfidence: 94,
        rulHours: cylRul,
        nominalTboHours: 1200,
        progressionSteps: cylSteps,
        primarySensors: [
          {
            name: 'CHT Peak',
            value: `${telemetry.cht}°C`,
            expected: '150–190°C',
            status: telemetry.cht > 190 ? 'stress' : 'nominal',
          },
          {
            name: 'Cyl #3 Knock',
            value: `${telemetry.cylinders[2]?.knockIndex || 0.04}`,
            expected: '< 0.15',
            status: (telemetry.cylinders[2]?.knockIndex || 0) > 0.2 ? 'stress' : 'nominal',
          },
          {
            name: 'Thermal Cycles',
            value: '48 sorties',
            expected: '< 120 cycles',
            status: 'nominal',
          },
        ],
        maintenanceAction:
          cylStatus === 'Degradation detected'
            ? 'Perform differential compression test & Cylinder #3 borescope inspection'
            : 'Inspect spark plug gap at next 100h depot check',
        icon: Flame,
        themeColor: '#ff1744',
      },
      {
        id: 'cooling',
        name: 'Cooling System',
        category: 'Heat Exchanger & Thermal Transfer',
        currentHealth: coolHealth,
        healthTrend: coolTrendText,
        trendDirection: coolTrendDirection,
        trendRate: coolStatus === 'Degradation detected' ? '-3.8%/hr' : '-0.04%/hr',
        degradationStatus: coolStatus,
        aiEstimate: coolAi,
        aiDelta: `Δ ${(coolAi - coolHealth).toFixed(1)}%`,
        aiConfidence: 93,
        rulHours: coolRul,
        nominalTboHours: 1500,
        progressionSteps: coolSteps,
        primarySensors: [
          {
            name: 'Coolant Heat Flux',
            value: `${telemetry.cht}°C`,
            expected: '150–190°C',
            status: telemetry.cht > 190 ? 'stress' : 'nominal',
          },
          {
            name: 'Oil Sump Heat',
            value: `${telemetry.oilTemp}°C`,
            expected: '80–105°C',
            status: telemetry.oilTemp > 105 ? 'stress' : 'nominal',
          },
          {
            name: 'Thermostatic Delta',
            value: 'Δ 22°C',
            expected: '18–28°C',
            status: 'nominal',
          },
        ],
        maintenanceAction:
          coolStatus === 'Degradation detected'
            ? 'Flush radiator core & verify thermostatic bypass valve actuation'
            : 'Inspect coolant level and pressure cap seal during 50h check',
        icon: Droplets,
        themeColor: '#00e5ff',
      },
      {
        id: 'lubrication',
        name: 'Lubrication System',
        category: 'Dry Sump & Hydrodynamic Bearings',
        currentHealth: lubHealth,
        healthTrend: lubTrendText,
        trendDirection: lubTrendDirection,
        trendRate: lubStatus === 'Degradation detected' ? '-6.8%/hr' : '-0.06%/hr',
        degradationStatus: lubStatus,
        aiEstimate: lubAi,
        aiDelta: `Δ ${(lubAi - lubHealth).toFixed(1)}%`,
        aiConfidence: 97,
        rulHours: lubRul,
        nominalTboHours: 800,
        progressionSteps: lubSteps,
        primarySensors: [
          {
            name: 'Oil Scavenge Press',
            value: `${telemetry.oilPressure} PSI`,
            expected: '45–65 PSI',
            status: telemetry.oilPressure < 45 ? 'stress' : 'nominal',
          },
          {
            name: 'Oil Temp',
            value: `${telemetry.oilTemp}°C`,
            expected: '80–105°C',
            status: telemetry.oilTemp > 105 ? 'stress' : 'nominal',
          },
          {
            name: 'Oil Viscosity Index',
            value: lubStatus === 'Degradation detected' ? 'SAE 10 (Sheared)' : 'SAE 10W-40 (Nominal)',
            expected: 'SAE 10W-40',
            status: lubStatus === 'Degradation detected' ? 'stress' : 'nominal',
          },
        ],
        maintenanceAction:
          lubStatus === 'Degradation detected'
            ? 'AIRCRAFT AOG WARNING: Cut-and-inspect oil filter for metal flakes; drain & refill synthetic oil'
            : 'Routine 50h oil and spin-on filter change',
        icon: Gauge,
        themeColor: '#00e676',
      },
      {
        id: 'mechanical',
        name: 'Mechanical System',
        category: 'Crankshaft, Bearings & Prop Reduction',
        currentHealth: mechHealth,
        healthTrend: mechTrendText,
        trendDirection: mechTrendDirection,
        trendRate: mechStatus === 'Degradation detected' ? '-5.1%/hr' : '-0.03%/hr',
        degradationStatus: mechStatus,
        aiEstimate: mechAi,
        aiDelta: `Δ ${(mechAi - mechHealth).toFixed(1)}%`,
        aiConfidence: 96,
        rulHours: mechRul,
        nominalTboHours: 2000,
        progressionSteps: mechSteps,
        primarySensors: [
          {
            name: 'Crankcase Vibration',
            value: `${telemetry.vibration} g`,
            expected: '0.40–1.20 g',
            status: telemetry.vibration > 1.2 ? 'stress' : 'nominal',
          },
          {
            name: 'Propeller RPM',
            value: `${telemetry.propellerRpm} RPM`,
            expected: '900–1080 RPM',
            status: 'nominal',
          },
          {
            name: 'Reduction Backlash',
            value: mechStatus === 'Degradation detected' ? '0.24 mm (Worn)' : '0.08 mm (Nominal)',
            expected: '< 0.12 mm',
            status: mechStatus === 'Degradation detected' ? 'stress' : 'nominal',
          },
        ],
        maintenanceAction:
          mechStatus === 'Degradation detected'
            ? 'Perform dynamic laser propeller balancing & inspect crankshaft thrust washer'
            : 'Standard 100h gearbox backlash check & rubber mount inspection',
        icon: Zap,
        themeColor: '#b388ff',
      },
      {
        id: 'fuel',
        name: 'Fuel System',
        category: 'High-Pressure EFI & Atomization',
        currentHealth: fuelHealth,
        healthTrend: fuelTrendText,
        trendDirection: fuelTrendDirection,
        trendRate: fuelStatus === 'Degradation detected' ? '-3.1%/hr' : '-0.04%/hr',
        degradationStatus: fuelStatus,
        aiEstimate: fuelAi,
        aiDelta: `Δ ${(fuelAi - fuelHealth).toFixed(1)}%`,
        aiConfidence: 95,
        rulHours: fuelRul,
        nominalTboHours: 1000,
        progressionSteps: fuelSteps,
        primarySensors: [
          {
            name: 'Fuel Flow Rate',
            value: `${telemetry.fuelFlow} L/h`,
            expected: '18.0–26.0 L/h',
            status: telemetry.fuelFlow > 26 ? 'stress' : 'nominal',
          },
          {
            name: 'Exhaust EGT',
            value: `${telemetry.egt}°C`,
            expected: '680–740°C',
            status: telemetry.egt > 740 ? 'stress' : 'nominal',
          },
          {
            name: 'Fuel Rail Pressure',
            value: `${telemetry.fuelPressure} PSI`,
            expected: '40–48 PSI',
            status: 'nominal',
          },
        ],
        maintenanceAction:
          fuelStatus === 'Degradation detected'
            ? 'Ultrasonic cleaning of fuel injector nozzles & fuel rail leak-down test'
            : 'Replace in-line 10-micron fuel filter at 100h service',
        icon: Fuel,
        themeColor: '#38bdf8',
      },
    ];
  }, [telemetry, simulationMode, recentChtStress, recentOilPStress, recentOilTStress, recentVibStress, recentEgtStress]);

  // Selected system for master deep-dive
  const activeSystem = useMemo(() => {
    return systems.find((s) => s.id === selectedSystemId) || systems[0];
  }, [systems, selectedSystemId]);

  // Lowest RUL bottleneck across all systems
  const bottleneckSystem = useMemo(() => {
    return [...systems].sort((a, b) => a.rulHours - b.rulHours)[0];
  }, [systems]);

  // Generate multi-system comparator chart data
  const comparatorChartData = useMemo(() => {
    return [
      { hour: '0h', cylinder: 100, cooling: 100, lubrication: 100, mechanical: 100, fuel: 100 },
      { hour: '35h', cylinder: 96, cooling: 95, lubrication: 97, mechanical: 96, fuel: 98 },
      { hour: '70h', cylinder: 93, cooling: 91, lubrication: 94, mechanical: 92, fuel: 95 },
      { hour: '105h', cylinder: 90, cooling: 87, lubrication: 91, mechanical: 89, fuel: 92 },
      {
        hour: '142h (Present)',
        cylinder: systems[0].currentHealth,
        cooling: systems[1].currentHealth,
        lubrication: systems[2].currentHealth,
        mechanical: systems[3].currentHealth,
        fuel: systems[4].currentHealth,
      },
      {
        hour: '+50h Proj',
        cylinder: Math.max(10, systems[0].currentHealth - (systems[0].degradationStatus === 'Degradation detected' ? 25 : 2)),
        cooling: Math.max(10, systems[1].currentHealth - (systems[1].degradationStatus === 'Degradation detected' ? 28 : 2)),
        lubrication: Math.max(10, systems[2].currentHealth - (systems[2].degradationStatus === 'Degradation detected' ? 45 : 3)),
        mechanical: Math.max(10, systems[3].currentHealth - (systems[3].degradationStatus === 'Degradation detected' ? 32 : 2)),
        fuel: Math.max(10, systems[4].currentHealth - (systems[4].degradationStatus === 'Degradation detected' ? 22 : 2)),
      },
    ];
  }, [systems]);

  return (
    <div className="space-y-4">
      {/* 0. Real-time Fault Simulator to demonstrate degradation changes */}
      <FaultSimulatorPanel />

      {/* Top Header & Fleet Prognostics Hero Banner */}
      <div className="bg-[#0b1324] border border-[#1b2b48] p-4 rounded-xl shadow-lg font-mono">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                Predictive Maintenance & Prognostic Health Management (PHM)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60">
                PHYSICS-INFORMED AI MODEL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Continuous wear tracking, physics-based degradation curves, and Remaining Useful Life (RUL) estimation
            </p>
          </div>

          {/* Mandatory Certified Interval Disclaimer Banner */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs">
            <Info className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span className="font-semibold">
              AI/model estimate — not a certified maintenance interval.
            </span>
          </div>
        </div>

        {/* Fleet RUL Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-[#16233a] text-xs">
          <div className="bg-[#070d19] p-3 rounded-lg border border-[#16233a]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Cumulative Engine Runtime
            </span>
            <span className="text-xl font-bold text-cyan-300 mt-0.5 block">
              {telemetry.engineRuntime}
            </span>
            <span className="text-[10px] text-slate-500">HOBBS Hour Meter</span>
          </div>

          <div className="bg-[#070d19] p-3 rounded-lg border border-[#16233a]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Critical RUL Bottleneck
            </span>
            <span
              className={`text-xl font-bold mt-0.5 block ${
                bottleneckSystem.rulHours <= 50 ? 'text-rose-400 animate-pulse' : 'text-slate-100'
              }`}
            >
              {bottleneckSystem.name}
            </span>
            <span className="text-[10px] text-slate-500">
              Shortest Horizon: {bottleneckSystem.rulHours} hrs
            </span>
          </div>

          <div className="bg-[#070d19] p-3 rounded-lg border border-[#16233a]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Next Scheduled Depot Inspection
            </span>
            <span className="text-xl font-bold text-slate-200 mt-0.5 block">
              57.4 flight hrs
            </span>
            <span className="text-[10px] text-slate-500">200h Major Interval</span>
          </div>

          <div className="bg-[#070d19] p-3 rounded-lg border border-[#16233a]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Prognostics Engine Status
            </span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SYNCHRONIZED</span>
            </span>
            <span className="text-[10px] text-slate-500">100% Deterministic</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: THE 5 REQUIRED SYSTEM HEALTH CARDS */}
      <div className="space-y-2 font-mono">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>5 Core Subsystem Health & Degradation Cards</span>
          </h3>
          <span className="text-[10px] text-slate-400">
            Click any card to load historical degradation curve & prescriptive action
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {systems.map((sys) => {
            const Icon = sys.icon;
            const isSelected = selectedSystemId === sys.id;
            const isDegraded = sys.degradationStatus === 'Degradation detected';
            const isImproving = sys.degradationStatus === 'Improving';
            const isCrit = sys.currentHealth < 50;

            return (
              <div
                key={sys.id}
                onClick={() => setSelectedSystemId(sys.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between shadow-xl relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#121e35] border-cyan-400 ring-1 ring-cyan-400/50'
                    : 'bg-[#0b1324] border-[#1d2d4d] hover:border-[#273d69]'
                } ${isCrit ? 'border-rose-500/70 shadow-[0_0_15px_rgba(255,23,68,0.15)]' : ''}`}
              >
                {/* Glow accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    backgroundColor: isCrit
                      ? '#ff1744'
                      : isDegraded
                      ? '#ffab00'
                      : sys.themeColor,
                  }}
                />

                <div className="space-y-3">
                  {/* Card Header: Icon, Name & Status Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="p-1.5 rounded-lg border"
                        style={{
                          backgroundColor: `${sys.themeColor}15`,
                          borderColor: `${sys.themeColor}40`,
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: sys.themeColor }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-xs leading-tight">
                          {sys.name}
                        </h4>
                        <span className="text-[9px] text-slate-500 block">
                          {sys.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Degradation Status Indicator Pill (Degradation detected | Stable | Improving) */}
                  <div className="pt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isDegraded
                          ? 'bg-rose-950 text-rose-300 border border-rose-700/80 animate-pulse'
                          : isImproving
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {isDegraded ? (
                        <AlertOctagon className="w-3 h-3 text-rose-400" />
                      ) : isImproving ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      )}
                      <span>{sys.degradationStatus}</span>
                    </span>
                  </div>

                  {/* 1. CURRENT HEALTH */}
                  <div className="bg-[#070d19] border border-[#16233a] p-2.5 rounded-lg">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[10px] text-slate-400 uppercase">
                        Current Health
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          isCrit
                            ? 'text-rose-400'
                            : sys.currentHealth < 75
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {sys.currentHealth}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#142038] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCrit
                            ? 'bg-rose-500'
                            : sys.currentHealth < 75
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${sys.currentHealth}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. HEALTH TREND */}
                  <div className="flex items-center justify-between text-[11px] px-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Trend:</span>
                    </span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        sys.trendDirection === 'degrading'
                          ? 'text-rose-400'
                          : sys.trendDirection === 'improving'
                          ? 'text-emerald-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {sys.trendDirection === 'degrading' ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : sys.trendDirection === 'improving' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      <span>{sys.healthTrend}</span>
                    </span>
                  </div>

                  {/* 3. AI / MODEL ESTIMATE */}
                  <div className="bg-[#091122] border border-[#17253f] p-2 rounded-lg text-[10px] flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">
                        AI/Model Estimate
                      </span>
                      <span className="font-bold text-slate-200">
                        {sys.aiEstimate}%
                        <span className="text-cyan-400 font-normal ml-1">
                          ({sys.aiDelta})
                        </span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[8px] uppercase">
                        Conf
                      </span>
                      <span className="font-bold text-purple-300">
                        {sys.aiConfidence}%
                      </span>
                    </div>
                  </div>

                  {/* 4. DEGRADATION GRAPH: Health Over Time Steps */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                      Degradation History (Health over Time):
                    </span>
                    <div className="bg-[#070d19] border border-[#16233a] p-1.5 rounded-lg text-center font-bold text-[10px] flex items-center justify-between text-slate-300">
                      {sys.progressionSteps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span
                            className={`${
                              idx === sys.progressionSteps.length - 1
                                ? isCrit
                                  ? 'text-rose-400 font-black'
                                  : 'text-cyan-300 font-black'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.health}%
                          </span>
                          {idx < sys.progressionSteps.length - 1 && (
                            <span className="text-slate-600 font-normal">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* 5. ESTIMATED REMAINING USEFUL LIFE */}
                  <div
                    className={`p-2.5 rounded-lg border text-center ${
                      isCrit
                        ? 'bg-rose-950/40 border-rose-500/60'
                        : 'bg-[#091224] border-[#182643]'
                    }`}
                  >
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Estimated Remaining Useful Life
                    </span>
                    <span
                      className={`text-xl font-black block mt-0.5 ${
                        isCrit ? 'text-rose-400 animate-pulse' : 'text-cyan-300'
                      }`}
                    >
                      {sys.rulHours}{' '}
                      <span className="text-xs text-slate-400 font-normal">
                        operating hours
                      </span>
                    </span>
                    <span className="text-[8px] text-slate-500 block mt-0.5 italic">
                      AI/model estimate — not a certified maintenance interval.
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#16233a] flex items-center justify-between text-[9px] text-slate-400">
                  <span>Nominal TBO: {sys.nominalTboHours}h</span>
                  <span className="text-cyan-400 font-semibold">View Detail →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MASTER DEEP-DIVE DEGRADATION GRAPH & PRESCRIPTIVE ADVISORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
        {/* Left 2 Cols: High-Resolution Degradation Curve */}
        <div className="lg:col-span-2 bg-[#0b1324] border border-[#1d2d4d] p-5 rounded-xl shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182643] pb-3">
            <div className="flex items-center space-x-2.5">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: activeSystem.themeColor }}
              />
              <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
                {activeSystem.name} — Prognostic Degradation Trajectory
              </h3>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-cyan-400 rounded-sm" />
                <span className="text-slate-200">Historical Health</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-rose-500" />
                <span className="text-rose-400">Degradation Limit (60%)</span>
              </span>
            </div>
          </div>

          {/* Area Chart: Progression steps from 100% down to current & projected */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activeSystem.progressionSteps}
                margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="degradGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={activeSystem.themeColor}
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="95%"
                      stopColor={activeSystem.themeColor}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#152238" strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="hour"
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={{ stroke: '#1e293b' }}
                />

                <YAxis
                  stroke="#475569"
                  domain={[20, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={{ stroke: '#1e293b' }}
                  ticks={[20, 40, 60, 80, 100]}
                />

                {/* Critical Replacement Limit Reference Line (60%) */}
                <ReferenceLine
                  y={60}
                  stroke="#ff1744"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Service Threshold (60%)',
                    fill: '#ff5252',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />

                {/* Nominal Baseline Band */}
                <ReferenceArea
                  y1={85}
                  y2={100}
                  fill="#00e676"
                  fillOpacity={0.05}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a101d',
                    borderColor: '#1e2c45',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                  formatter={(val: any) => [`${val}% Health`, 'System Health']}
                />

                <Area
                  type="monotone"
                  dataKey="health"
                  stroke={activeSystem.themeColor}
                  strokeWidth={2.8}
                  fill="url(#degradGrad)"
                  dot={{
                    r: 5,
                    fill: activeSystem.themeColor,
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[#182643] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
            <span>
              Degradation Curve: 100% → 95% → 91% → 87% → {activeSystem.currentHealth}%
            </span>
            <span className="text-amber-400 font-semibold italic">
              AI/model estimate — not a certified maintenance interval.
            </span>
          </div>
        </div>

        {/* Right 1 Col: Prescriptive Maintenance Advisory */}
        <div className="bg-[#0b1324] border border-[#1d2d4d] p-5 rounded-xl shadow-2xl flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="border-b border-[#182643] pb-2">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                  Prescriptive Action: {activeSystem.name}
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                Ground crew remediation guidelines
              </span>
            </div>

            {/* Contributing Sensor Stress Factors */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Contributing Sensor Stress Telemetry:
              </span>
              <div className="space-y-1 bg-[#070d19] border border-[#16233a] p-2 rounded-lg">
                {activeSystem.primarySensors.map((sen, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[10px] py-0.5 border-b border-[#121c2d] last:border-0"
                  >
                    <span className="text-slate-400">{sen.name}:</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold ${
                          sen.status === 'stress' ? 'text-rose-400' : 'text-slate-200'
                        }`}
                      >
                        {sen.value}
                      </span>
                      <span className="text-[8px] text-slate-500">
                        (Exp: {sen.expected})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptive Maintenance Directive */}
            <div
              className={`p-3 rounded-xl border ${
                activeSystem.degradationStatus === 'Degradation detected'
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                  : 'bg-[#091325] border-[#1b2f54] text-slate-200'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider font-bold block mb-1 text-cyan-300">
                Actionable Maintenance Recommendation:
              </span>
              <p className="text-xs leading-relaxed">
                {activeSystem.maintenanceAction}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#182643] text-[10px] text-slate-500">
            Estimated RUL: <strong className="text-cyan-300">{activeSystem.rulHours} operating hours</strong> based on simulated historical wear rate.
          </div>
        </div>
      </div>

      {/* SECTION 3: MULTI-SYSTEM FLEET COMPARATOR TIMELINE */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] p-4 rounded-xl shadow-xl font-mono text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182643] pb-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-xs">
              5-System Simultaneous Degradation Fleet Comparator
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Synchronized wear trajectories comparing Cylinder, Cooling, Lubrication, Mechanical, and Fuel
          </span>
        </div>

        <div className="h-56 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={comparatorChartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid stroke="#152238" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 9 }}
              />
              <YAxis
                stroke="#475569"
                domain={[10, 100]}
                tick={{ fill: '#64748b', fontSize: 9 }}
              />
              <ReferenceLine y={60} stroke="#ff1744" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090f1d',
                  borderColor: '#1e2c45',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <Line
                type="monotone"
                dataKey="cylinder"
                name="Cylinder System"
                stroke="#ff1744"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="cooling"
                name="Cooling System"
                stroke="#00e5ff"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="lubrication"
                name="Lubrication System"
                stroke="#00e676"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="mechanical"
                name="Mechanical System"
                stroke="#b388ff"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="fuel"
                name="Fuel System"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-[#142038]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-rose-400">● Cylinder</span>
            <span className="flex items-center gap-1 text-cyan-400">● Cooling</span>
            <span className="flex items-center gap-1 text-emerald-400">● Lubrication</span>
            <span className="flex items-center gap-1 text-purple-400">● Mechanical</span>
            <span className="flex items-center gap-1 text-sky-400">● Fuel</span>
          </div>
          <span className="italic text-slate-500">
            AI/model estimate — not a certified maintenance interval.
          </span>
        </div>
      </div>
    </div>
  );
};
