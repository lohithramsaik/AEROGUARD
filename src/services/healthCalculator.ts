// ============================================================================
// HEALTH CALCULATION & PREDICTIVE DEGRADATION SERVICE
// Pipeline Stage: Engine State + AI Analysis + Digital Twin → Health Calculation
// ============================================================================

import {
  EngineState,
  AIAnalysis,
  HealthStatus,
  SubsystemHealthScore,
  ComponentHealth,
  DigitalTwinComponentKey,
  Fault,
} from '../types/engine';

/**
 * Calculates complete unified HealthStatus and subsystem health scores.
 * All pages (Overview, Health & Performance, Predictive Maintenance, etc.)
 * consume this exact same calculation.
 */
export function calculateHealthStatus(
  state: EngineState,
  ai: AIAnalysis,
  components: Record<DigitalTwinComponentKey, ComponentHealth>,
  activeFaults: Fault[] = []
): HealthStatus {
  const timeNow = new Date().toTimeString().split(' ')[0] + ' UTC';

  // 1. CYLINDER SYSTEM HEALTH (CHT & Knock Sensitivity)
  let cylHealth = 96;
  let cylTrend: 'RISING' | 'STEADY' | 'DEGRADING' = 'STEADY';
  let cylDegradation: 'Degradation detected' | 'Stable' | 'Improving' = 'Stable';
  let cylRul = 820;

  if (state.cht >= 195) {
    cylHealth = 44;
    cylTrend = 'DEGRADING';
    cylDegradation = 'Degradation detected';
    cylRul = 42;
  } else if (state.cht >= 186) {
    cylHealth = 72;
    cylTrend = 'DEGRADING';
    cylDegradation = 'Degradation detected';
    cylRul = 140;
  }
  const cylStatus = cylHealth >= 85 ? 'OPTIMAL' : cylHealth >= 65 ? 'DEGRADED' : 'CRITICAL';

  // 2. COOLING SYSTEM HEALTH (CHT & Oil Temp Sensitivity)
  let coolHealth = 94;
  let coolTrend: 'RISING' | 'STEADY' | 'DEGRADING' = 'STEADY';
  let coolDegradation: 'Degradation detected' | 'Stable' | 'Improving' = 'Stable';
  let coolRul = 960;

  if (state.cht >= 195 || state.oilTemp >= 115) {
    coolHealth = 38;
    coolTrend = 'DEGRADING';
    coolDegradation = 'Degradation detected';
    coolRul = 56;
  } else if (state.cht >= 186 || state.oilTemp >= 106) {
    coolHealth = 64;
    coolTrend = 'DEGRADING';
    coolDegradation = 'Degradation detected';
    coolRul = 190;
  }
  const coolStatus = coolHealth >= 80 ? 'OPTIMAL' : coolHealth >= 60 ? 'DEGRADED' : 'CRITICAL';

  // 3. LUBRICATION SYSTEM HEALTH (Oil Pressure & Temp Sensitivity)
  let lubHealth = 97;
  let lubTrend: 'RISING' | 'STEADY' | 'DEGRADING' = 'STEADY';
  let lubDegradation: 'Degradation detected' | 'Stable' | 'Improving' = 'Stable';
  let lubRul = 1100;

  if (state.oilPressure <= 30) {
    lubHealth = 24;
    lubTrend = 'DEGRADING';
    lubDegradation = 'Degradation detected';
    lubRul = 18;
  } else if (state.oilPressure <= 42 || state.oilTemp >= 110) {
    lubHealth = 68;
    lubTrend = 'DEGRADING';
    lubDegradation = 'Degradation detected';
    lubRul = 110;
  }
  const lubStatus = lubHealth >= 85 ? 'OPTIMAL' : lubHealth >= 65 ? 'DEGRADED' : 'CRITICAL';

  // 4. MECHANICAL SYSTEM HEALTH (Vibration & Torque Sensitivity)
  let mechHealth = 95;
  let mechTrend: 'RISING' | 'STEADY' | 'DEGRADING' = 'STEADY';
  let mechDegradation: 'Degradation detected' | 'Stable' | 'Improving' = 'Stable';
  let mechRul = 1200;

  if (state.vibration >= 2.0) {
    mechHealth = 34;
    mechTrend = 'DEGRADING';
    mechDegradation = 'Degradation detected';
    mechRul = 36;
  } else if (state.vibration >= 1.4) {
    mechHealth = 70;
    mechTrend = 'DEGRADING';
    mechDegradation = 'Degradation detected';
    mechRul = 160;
  }
  const mechStatus = mechHealth >= 80 ? 'OPTIMAL' : mechHealth >= 60 ? 'DEGRADED' : 'CRITICAL';

  // 5. FUEL SYSTEM HEALTH (Fuel Flow & Pressure Sensitivity)
  let fuelHealth = 98;
  let fuelTrend: 'RISING' | 'STEADY' | 'DEGRADING' = 'STEADY';
  let fuelDegradation: 'Degradation detected' | 'Stable' | 'Improving' = 'Stable';
  let fuelRul = 1400;

  if (state.fuelFlow >= 29 || state.fuelPressure <= 35) {
    fuelHealth = 58;
    fuelTrend = 'DEGRADING';
    fuelDegradation = 'Degradation detected';
    fuelRul = 180;
  } else if (state.fuelFlow >= 27 || state.fuelPressure <= 38) {
    fuelHealth = 78;
    fuelTrend = 'DEGRADING';
    fuelDegradation = 'Degradation detected';
    fuelRul = 420;
  }
  const fuelStatus = fuelHealth >= 85 ? 'OPTIMAL' : fuelHealth >= 65 ? 'DEGRADED' : 'CRITICAL';

  // 6. COMBUSTION SYSTEM HEALTH (EGT & Spark Sensitivity)
  let combHealth = 96;
  let combTrend: 'RISING' | 'STEADY' | 'DEGRADING' = 'STEADY';
  let combDegradation: 'Degradation detected' | 'Stable' | 'Improving' = 'Stable';
  let combRul = 750;

  if (state.egt >= 780) {
    combHealth = 46;
    combTrend = 'DEGRADING';
    combDegradation = 'Degradation detected';
    combRul = 48;
  } else if (state.egt >= 750) {
    combHealth = 74;
    combTrend = 'DEGRADING';
    combDegradation = 'Degradation detected';
    combRul = 150;
  }
  const combStatus = combHealth >= 85 ? 'OPTIMAL' : combHealth >= 65 ? 'DEGRADED' : 'CRITICAL';

  const subsystems: SubsystemHealthScore[] = [
    {
      id: 'cylinder',
      name: 'Cylinder System',
      category: 'Combustion & Heads',
      healthPercent: cylHealth,
      status: cylStatus,
      trend: cylTrend,
      trendRate: cylStatus === 'CRITICAL' ? '-3.4%/hr' : '-0.05%/hr',
      lastUpdate: timeNow,
      contributingParameter: `CHT ${state.cht}°C`,
      rulHours: cylRul,
      degradationStatus: cylDegradation,
    },
    {
      id: 'cooling',
      name: 'Cooling System',
      category: 'Thermal Circulation',
      healthPercent: coolHealth,
      status: coolStatus,
      trend: coolTrend,
      trendRate: coolStatus === 'CRITICAL' ? '-3.8%/hr' : '-0.04%/hr',
      lastUpdate: timeNow,
      contributingParameter: `CHT ${state.cht}°C / Oil ${state.oilTemp}°C`,
      rulHours: coolRul,
      degradationStatus: coolDegradation,
    },
    {
      id: 'lubrication',
      name: 'Lubrication System',
      category: 'Dry-Sump Fluidics',
      healthPercent: lubHealth,
      status: lubStatus,
      trend: lubTrend,
      trendRate: lubStatus === 'CRITICAL' ? '-4.5%/hr' : '-0.02%/hr',
      lastUpdate: timeNow,
      contributingParameter: `Oil Pressure ${state.oilPressure} PSI`,
      rulHours: lubRul,
      degradationStatus: lubDegradation,
    },
    {
      id: 'mechanical',
      name: 'Mechanical System',
      category: 'Transmission & Bearings',
      healthPercent: mechHealth,
      status: mechStatus,
      trend: mechTrend,
      trendRate: mechStatus === 'CRITICAL' ? '-3.8%/hr' : '-0.03%/hr',
      lastUpdate: timeNow,
      contributingParameter: `Vibration ${state.vibration} g`,
      rulHours: mechRul,
      degradationStatus: mechDegradation,
    },
    {
      id: 'fuel',
      name: 'Fuel System',
      category: 'EFI Injection',
      healthPercent: fuelHealth,
      status: fuelStatus,
      trend: fuelTrend,
      trendRate: fuelStatus === 'CRITICAL' ? '-2.0%/hr' : '-0.01%/hr',
      lastUpdate: timeNow,
      contributingParameter: `Fuel Flow ${state.fuelFlow} L/h`,
      rulHours: fuelRul,
      degradationStatus: fuelDegradation,
    },
    {
      id: 'combustion',
      name: 'Combustion System',
      category: 'Ignition & Exhaust',
      healthPercent: combHealth,
      status: combStatus,
      trend: combTrend,
      trendRate: combStatus === 'CRITICAL' ? '-3.1%/hr' : '-0.02%/hr',
      lastUpdate: timeNow,
      contributingParameter: `EGT ${state.egt}°C`,
      rulHours: combRul,
      degradationStatus: combDegradation,
    },
  ];

  // 7. OVERALL ENGINE HEALTH
  // Weighted harmonic mean of subsystem healths with high penalty for minimum subsystem
  const minSubsystemHealth = Math.min(...subsystems.map((s) => s.healthPercent));
  const avgSubsystemHealth =
    subsystems.reduce((acc, s) => acc + s.healthPercent, 0) / subsystems.length;

  let overallHealth = Math.round(avgSubsystemHealth * 0.4 + minSubsystemHealth * 0.6);
  overallHealth = Math.max(15, Math.min(100, overallHealth));

  const criticalCount = activeFaults.filter((f) => f.severity === 'CRITICAL').length;
  const warningCount = activeFaults.filter((f) => f.severity === 'WARNING').length;

  return {
    engineHealth: overallHealth,
    droneHealth: criticalCount > 0 ? 76 : warningCount > 0 ? 89 : 98,
    aiConfidence: ai.confidence,
    activeFaultCount: criticalCount,
    activeWarningCount: warningCount,
    resolvedFaultCount: 0, // Injected by EngineContext from faultHistory
    subsystems,
  };
}
