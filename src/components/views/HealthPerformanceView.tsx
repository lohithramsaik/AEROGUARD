import React, { useMemo } from 'react';
import {
  HeartPulse,
  Flame,
  Droplets,
  Fuel,
  Zap,
  Activity,
  Gauge,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Layers,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';

interface SubsystemHealth {
  id: string;
  name: string;
  category: string;
  healthPercent: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  trend: 'RISING' | 'STEADY' | 'DEGRADING';
  trendRate: string;
  lastUpdate: string;
  contributingParameter: string;
  icon: React.ElementType;
}

export const HealthPerformanceView: React.FC = () => {
  const { telemetry, history, simulationMode, healthMetrics, subsystemHealthList } = useEngine();

  const currentTime = useMemo(() => {
    return new Date().toTimeString().split(' ')[0] + ' UTC';
  }, [telemetry]);

  const getSubsystemIcon = (id: string): React.ElementType => {
    switch (id) {
      case 'cylinder': return Layers;
      case 'cooling': return Droplets;
      case 'lubrication': return Flame;
      case 'fuel': return Fuel;
      case 'combustion': return Zap;
      case 'mechanical': return Activity;
      default: return Gauge;
    }
  };

  // Consume the centralized subsystem health list from the single EngineState data pipeline
  const subsystems: SubsystemHealth[] = useMemo(() => {
    return subsystemHealthList.map((sub) => ({
      id: sub.id,
      name: sub.name,
      category: sub.category,
      healthPercent: sub.healthPercent,
      status: sub.status,
      trend: sub.trend,
      trendRate: sub.trendRate,
      lastUpdate: sub.lastUpdate,
      contributingParameter: sub.contributingParameter,
      icon: getSubsystemIcon(sub.id),
    }));
  }, [subsystemHealthList]);

  // Performance Section: Compute rolling averages from history buffer
  const performanceAverages = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        avgRpm: telemetry.rpm,
        avgEngineLoad: telemetry.engineLoad,
        avgCht: telemetry.cht,
        avgEgt: telemetry.egt,
      };
    }

    const sumRpm = history.reduce((acc, h) => acc + h.rpm, 0);
    const sumLoad = history.reduce((acc, h) => acc + (h.engineLoad || 68.0), 0);
    const sumCht = history.reduce((acc, h) => acc + h.cht, 0);
    const sumEgt = history.reduce((acc, h) => acc + h.egt, 0);

    return {
      avgRpm: Math.round(sumRpm / history.length),
      avgEngineLoad: Number((sumLoad / history.length).toFixed(1)),
      avgCht: Number((sumCht / history.length).toFixed(1)),
      avgEgt: Math.round(sumEgt / history.length),
    };
  }, [history, telemetry]);

  const overallHealth = healthMetrics.engineHealth;

  return (
    <div className="space-y-4">
      {/* 0. Interactive Fault Simulator */}
      <FaultSimulatorPanel />

      {/* TOP HERO SECTION: Overall Engine Health Card */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-5 shadow-xl font-mono relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div
              className={`w-16 h-16 rounded-xl border flex items-center justify-center shadow-lg ${
                overallHealth >= 80
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-400'
                  : overallHealth >= 60
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-400'
                  : 'bg-rose-950/80 border-rose-500/70 text-rose-400 animate-pulse'
              }`}
            >
              <HeartPulse className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                PROPULSION HEALTH ENSEMBLE
              </span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase">
                  Engine Health —
                </h2>
                <span
                  className={`text-2xl sm:text-3xl font-black ${
                    overallHealth >= 80
                      ? 'text-emerald-400'
                      : overallHealth >= 60
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {overallHealth}%
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Weighted algorithmic synthesis across 6 core propulsion subsystems (Cylinder, Cooling, Lubrication, Fuel, Combustion, Mechanical).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end space-y-1 text-xs">
            <span
              className={`px-3 py-1 rounded font-bold uppercase tracking-wider ${
                overallHealth >= 80
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  : overallHealth >= 60
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse'
              }`}
            >
              STATUS: {overallHealth >= 80 ? 'OPTIMAL' : overallHealth >= 60 ? 'DEGRADED' : 'CRITICAL'}
            </span>
            <span className="text-[10px] text-slate-400">
              SYNCHRONIZED: {currentTime}
            </span>
          </div>
        </div>

        {/* Multi-Segment Master Progress Bar */}
        <div className="mt-4 pt-3 border-t border-[#182643]">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
            <span>Overall Subsystem Integrity Scale</span>
            <span className="font-bold text-slate-200">
              {overallHealth}% Operational Capacity
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#111a2f] rounded-full overflow-hidden p-0.5 border border-[#1e2f50]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallHealth >= 80
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                  : overallHealth >= 60
                  ? 'bg-gradient-to-r from-cyan-400 to-amber-400'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500'
              }`}
              style={{ width: `${overallHealth}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: 6 Individual Subsystem Health Gauges / Cards */}
      <section className="space-y-3 font-mono">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Individual Subsystem Health Scores (6 Systems)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            AUTOMATIC DEGRADATION RESPONSE ENGAGED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {subsystems.map((sub) => {
            const Icon = sub.icon;
            const isCrit = sub.status === 'CRITICAL';
            const isDeg = sub.status === 'DEGRADED';

            const TrendIcon =
              sub.trend === 'DEGRADING'
                ? ArrowDownRight
                : sub.trend === 'RISING'
                ? ArrowUpRight
                : ArrowRight;

            return (
              <div
                key={sub.id}
                className={`bg-[#0b1324] border rounded-xl p-4 shadow-lg flex flex-col justify-between transition-all duration-300 ${
                  isCrit
                    ? 'border-rose-500/70 shadow-[0_0_18px_rgba(255,23,68,0.2)]'
                    : isDeg
                    ? 'border-amber-500/60 shadow-[0_0_12px_rgba(255,171,0,0.15)]'
                    : 'border-[#1d2d4d] hover:border-[#2b416e]'
                }`}
              >
                {/* Header: Name & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`p-1.5 rounded-lg border ${
                          isCrit
                            ? 'bg-rose-950/80 border-rose-500/60 text-rose-400'
                            : isDeg
                            ? 'bg-amber-950/80 border-amber-500/60 text-amber-400'
                            : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 uppercase">
                          {sub.name} — {sub.healthPercent}%
                        </h4>
                        <span className="text-[9px] text-slate-400 block">
                          {sub.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        isCrit
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isDeg
                          ? 'bg-amber-600 text-black'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  {/* Big Health Value & Progress Indicator */}
                  <div className="my-2.5">
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-slate-400 text-[11px]">System Health:</span>
                      <span
                        className={`text-2xl font-black ${
                          isCrit
                            ? 'text-rose-400'
                            : isDeg
                            ? 'text-amber-400'
                            : 'text-slate-100'
                        }`}
                      >
                        {sub.healthPercent}%
                      </span>
                    </div>

                    {/* Progress Bar Indicator */}
                    <div className="h-2 w-full bg-[#111a2f] rounded-full overflow-hidden p-0.5 border border-[#1b2b48]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCrit
                            ? 'bg-rose-500'
                            : isDeg
                            ? 'bg-amber-400'
                            : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                        }`}
                        style={{ width: `${sub.healthPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Contributing Sensor Detail */}
                  <div className="bg-[#09101f] p-2 rounded border border-[#172540] text-[10px] text-slate-300 mb-2">
                    <span className="text-slate-500 block text-[9px] uppercase">
                      Primary Driving Parameter:
                    </span>
                    <strong className="text-slate-200">{sub.contributingParameter}</strong>
                  </div>
                </div>

                {/* Footer: Trend & Last Update */}
                <div className="pt-2 border-t border-[#182643] flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <TrendIcon
                      className={`w-3.5 h-3.5 ${
                        sub.trend === 'DEGRADING'
                          ? 'text-rose-400'
                          : sub.trend === 'RISING'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={
                        sub.trend === 'DEGRADING'
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }
                    >
                      Trend: {sub.trend} ({sub.trendRate})
                    </span>
                  </span>

                  <span className="text-slate-500 text-[9px]">
                    Update: {sub.lastUpdate.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: Performance Section */}
      <section className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-5 shadow-xl font-mono text-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2b48] pb-3">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Aero Propulsion Performance Envelopes & Flight Statistics
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            5-MINUTE ROLLING BUFFER INTEGRATION
          </span>
        </div>

        {/* 6 Required Performance Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Average RPM */}
          <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1a2845] flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Average RPM
              </span>
              <span className="text-xl lg:text-2xl font-black text-cyan-300 mt-1 block">
                {performanceAverages.avgRpm}
              </span>
              <span className="text-[10px] text-slate-400">RPM (5m mean)</span>
            </div>
            <div className="pt-2 mt-2 border-t border-[#16233c] text-[9px] text-slate-500">
              Envelope: 2200–2600
            </div>
          </div>

          {/* 2. Average Engine Load */}
          <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1a2845] flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Average Engine Load
              </span>
              <span className="text-xl lg:text-2xl font-black text-slate-100 mt-1 block">
                {performanceAverages.avgEngineLoad}%
              </span>
              <span className="text-[10px] text-slate-400">Calculated Duty Cycle</span>
            </div>
            <div className="pt-2 mt-2 border-t border-[#16233c] text-[9px] text-slate-500">
              Target: 60–75% Cruise
            </div>
          </div>

          {/* 3. Average CHT */}
          <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1a2845] flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Average CHT
              </span>
              <span
                className={`text-xl lg:text-2xl font-black mt-1 block ${
                  performanceAverages.avgCht >= 190
                    ? 'text-rose-400'
                    : performanceAverages.avgCht >= 180
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {performanceAverages.avgCht}°C
              </span>
              <span className="text-[10px] text-slate-400">Cylinder Head Mean</span>
            </div>
            <div className="pt-2 mt-2 border-t border-[#16233c] text-[9px] text-slate-500">
              Limit: 190.0°C Max
            </div>
          </div>

          {/* 4. Average EGT */}
          <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1a2845] flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Average EGT
              </span>
              <span
                className={`text-xl lg:text-2xl font-black mt-1 block ${
                  performanceAverages.avgEgt >= 760 ? 'text-amber-400' : 'text-slate-100'
                }`}
              >
                {performanceAverages.avgEgt}°C
              </span>
              <span className="text-[10px] text-slate-400">Exhaust Runner Mean</span>
            </div>
            <div className="pt-2 mt-2 border-t border-[#16233c] text-[9px] text-slate-500">
              Limit: 740.0°C Nominal
            </div>
          </div>

          {/* 5. Fuel Consumption */}
          <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1a2845] flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Fuel Consumption
              </span>
              <span className="text-xl lg:text-2xl font-black text-amber-300 mt-1 block">
                {telemetry.fuelConsumption} L
              </span>
              <span className="text-[10px] text-slate-400">
                Rate: {telemetry.fuelFlow} L/h
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-[#16233c] text-[9px] text-slate-500">
              Remaining: {telemetry.fuelRemaining} L
            </div>
          </div>

          {/* 6. Engine Runtime */}
          <div className="bg-[#0e172a] p-3 rounded-lg border border-[#1a2845] flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Engine Runtime
              </span>
              <span className="text-xl lg:text-2xl font-black text-emerald-400 mt-1 block">
                {telemetry.engineRuntime}
              </span>
              <span className="text-[10px] text-slate-400">Total Hours (HOBBS)</span>
            </div>
            <div className="pt-2 mt-2 border-t border-[#16233c] text-[9px] text-slate-500">
              TBO Interval: 2,000h
            </div>
          </div>
        </div>

        {/* Bottom Context Footer */}
        <div className="pt-2 border-t border-[#182643] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
          <span>
            DATA SOURCE: CENTRALIZED AVIONICS BUS [EngineContext • ROTAX 916iSc-TC TELEM]
          </span>
          <span className="text-cyan-400">
            DIAGNOSTIC CYCLE: CONTINUOUS REAL-TIME INTEGRATION
          </span>
        </div>
      </section>
    </div>
  );
};
