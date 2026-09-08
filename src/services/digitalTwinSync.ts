// ============================================================================
// DIGITAL TWIN SYNCHRONIZATION SERVICE
// Pipeline Stage: Engine State → Digital Twin Component Physical Mapping
// ============================================================================

import { EngineState, ComponentHealth, DigitalTwinComponentKey } from '../types/engine';

/**
 * Synchronize the 9 core 3D CAD physical engine components with the current EngineState
 */
export function syncDigitalTwinComponents(
  state: EngineState
): Record<DigitalTwinComponentKey, ComponentHealth> {
  const timeNow = new Date().toTimeString().split(' ')[0] + ' UTC';

  // 1. CYLINDERS (Sensitive to CHT & Knock)
  const cylStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.cht >= 195 ? 'FAULT' : state.cht >= 186 ? 'WARNING' : 'NORMAL';
  const cylHealth = cylStatus === 'FAULT' ? 44 : cylStatus === 'WARNING' ? 72 : 96;
  const cylColor = cylStatus === 'FAULT' ? '#ef4444' : cylStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const cylRul = cylStatus === 'FAULT' ? 42 : cylStatus === 'WARNING' ? 140 : 820;

  // 2. PISTONS (Sensitive to CHT & Combustion Heat)
  const pistonStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.cht >= 198 ? 'FAULT' : state.cht >= 188 ? 'WARNING' : 'NORMAL';
  const pistonHealth = pistonStatus === 'FAULT' ? 48 : pistonStatus === 'WARNING' ? 78 : 95;
  const pistonColor = pistonStatus === 'FAULT' ? '#ef4444' : pistonStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const pistonRul = pistonStatus === 'FAULT' ? 55 : pistonStatus === 'WARNING' ? 180 : 880;

  // 3. CONNECTING RODS (Sensitive to Vibration & Torque)
  const rodStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.vibration >= 2.2 ? 'FAULT' : state.vibration >= 1.4 ? 'WARNING' : 'NORMAL';
  const rodHealth = rodStatus === 'FAULT' ? 51 : rodStatus === 'WARNING' ? 80 : 95;
  const rodColor = rodStatus === 'FAULT' ? '#ef4444' : rodStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const rodRul = rodStatus === 'FAULT' ? 68 : rodStatus === 'WARNING' ? 220 : 920;

  // 4. CRANKSHAFT (Sensitive to Tri-Axial Vibration)
  const crankStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.vibration >= 2.0 ? 'FAULT' : state.vibration >= 1.4 ? 'WARNING' : 'NORMAL';
  const crankHealth = crankStatus === 'FAULT' ? 38 : crankStatus === 'WARNING' ? 76 : 96;
  const crankColor = crankStatus === 'FAULT' ? '#ef4444' : crankStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const crankRul = crankStatus === 'FAULT' ? 36 : crankStatus === 'WARNING' ? 160 : 1200;

  // 5. SPARK PLUGS (Sensitive to High CHT & EGT)
  const plugStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.cht >= 195 || state.egt >= 780 ? 'FAULT' : state.cht >= 186 || state.egt >= 750 ? 'WARNING' : 'NORMAL';
  const plugHealth = plugStatus === 'FAULT' ? 40 : plugStatus === 'WARNING' ? 75 : 94;
  const plugColor = plugStatus === 'FAULT' ? '#ef4444' : plugStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const plugRul = plugStatus === 'FAULT' ? 30 : plugStatus === 'WARNING' ? 95 : 350;

  // 6. INTAKE SYSTEM (Sensitive to Manifold Pressure & Throttle)
  const intakeStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.manifoldPressure >= 34.5 ? 'FAULT' : state.manifoldPressure >= 33.0 ? 'WARNING' : 'NORMAL';
  const intakeHealth = intakeStatus === 'FAULT' ? 55 : intakeStatus === 'WARNING' ? 82 : 98;
  const intakeColor = intakeStatus === 'FAULT' ? '#ef4444' : intakeStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const intakeRul = intakeStatus === 'FAULT' ? 90 : intakeStatus === 'WARNING' ? 310 : 1400;

  // 7. EXHAUST SYSTEM (Sensitive to EGT Excursion)
  const exhaustStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.egt >= 780 ? 'FAULT' : state.egt >= 750 ? 'WARNING' : 'NORMAL';
  const exhaustHealth = exhaustStatus === 'FAULT' ? 46 : exhaustStatus === 'WARNING' ? 74 : 96;
  const exhaustColor = exhaustStatus === 'FAULT' ? '#ef4444' : exhaustStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const exhaustRul = exhaustStatus === 'FAULT' ? 48 : exhaustStatus === 'WARNING' ? 150 : 750;

  // 8. COOLING SYSTEM (Sensitive to CHT & Oil Temp)
  const coolStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.cht >= 195 || state.oilTemp >= 115 ? 'FAULT' : state.cht >= 186 || state.oilTemp >= 106 ? 'WARNING' : 'NORMAL';
  const coolHealth = coolStatus === 'FAULT' ? 38 : coolStatus === 'WARNING' ? 64 : 97;
  const coolColor = coolStatus === 'FAULT' ? '#ef4444' : coolStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const coolRul = coolStatus === 'FAULT' ? 56 : coolStatus === 'WARNING' ? 190 : 960;

  // 9. LUBRICATION SYSTEM (Sensitive to Low Oil Pressure & Oil Temp)
  const lubStatus: 'NORMAL' | 'WARNING' | 'FAULT' =
    state.oilPressure <= 30 ? 'FAULT' : state.oilPressure <= 42 || state.oilTemp >= 110 ? 'WARNING' : 'NORMAL';
  const lubHealth = lubStatus === 'FAULT' ? 24 : lubStatus === 'WARNING' ? 68 : 98;
  const lubColor = lubStatus === 'FAULT' ? '#ef4444' : lubStatus === 'WARNING' ? '#f59e0b' : '#22c55e';
  const lubRul = lubStatus === 'FAULT' ? 18 : lubStatus === 'WARNING' ? 110 : 1100;

  return {
    cylinders: {
      key: 'cylinders',
      name: 'Cylinder Block & Heads (4x)',
      category: 'Thermal & Combustion',
      healthPercent: cylHealth,
      temperature: `${state.cht}°C`,
      vibration: `${state.vibration} g`,
      status: cylStatus,
      relatedSensors: ['CHT', 'EGT', 'Knock Sensor Array'],
      lastUpdate: timeNow,
      description: 'Cast aluminium Nikasil-lined cylinder barrels with pent-roof 4-valve heads.',
      actionAdvice: cylStatus !== 'NORMAL' ? 'Inspect cooling shroud baffles and check Cyl #3 fuel mixture' : 'Nominal operational status',
      meshHighlightColor: cylColor,
      rulHours: cylRul,
      degradationStatus: cylStatus === 'FAULT' ? 'Degradation detected' : cylStatus === 'WARNING' ? 'Degradation detected' : 'Stable',
      trendRate: cylStatus === 'FAULT' ? '-3.4%/hr' : '-0.05%/hr',
    },
    pistons: {
      key: 'pistons',
      name: 'Forged Piston Assemblies (4x)',
      category: 'Kinematics & Reciprocating',
      healthPercent: pistonHealth,
      temperature: `${(state.cht + 12).toFixed(1)}°C (Est.)`,
      vibration: `${state.vibration} g`,
      status: pistonStatus,
      relatedSensors: ['CHT', 'Oil Temp', 'RPM'],
      lastUpdate: timeNow,
      description: 'High-strength hypereutectic aluminum alloy pistons with dual compression and oil scraper rings.',
      actionAdvice: pistonStatus !== 'NORMAL' ? 'Check cylinder wall scoring and oil blow-by pressure' : 'Nominal ring tension',
      meshHighlightColor: pistonColor,
      rulHours: pistonRul,
      degradationStatus: pistonStatus !== 'NORMAL' ? 'Degradation detected' : 'Stable',
      trendRate: pistonStatus !== 'NORMAL' ? '-2.8%/hr' : '-0.04%/hr',
    },
    connectingRods: {
      key: 'connectingRods',
      name: 'Connecting Rods & Big-End Bearings',
      category: 'Mechanical Transmission',
      healthPercent: rodHealth,
      temperature: `${state.oilTemp}°C`,
      vibration: `${state.vibration} g`,
      status: rodStatus,
      relatedSensors: ['Vibration', 'Engine Torque', 'Oil Pressure'],
      lastUpdate: timeNow,
      description: 'Drop-forged 4340 chromoly steel H-beam connecting rods with tri-metal lead-indium bearings.',
      actionAdvice: rodStatus !== 'NORMAL' ? 'Inspect bearing clearance and oil filter screen for bronze particles' : 'Hydrodynamic clearance within spec',
      meshHighlightColor: rodColor,
      rulHours: rodRul,
      degradationStatus: rodStatus !== 'NORMAL' ? 'Degradation detected' : 'Stable',
      trendRate: rodStatus !== 'NORMAL' ? '-2.5%/hr' : '-0.03%/hr',
    },
    crankshaft: {
      key: 'crankshaft',
      name: 'Forged Counterweighted Crankshaft',
      category: 'Mechanical Transmission',
      healthPercent: crankHealth,
      temperature: `${state.oilTemp}°C`,
      vibration: `${state.vibration} g`,
      status: crankStatus,
      relatedSensors: ['Vibration', 'Engine RPM', 'Oil Pressure'],
      lastUpdate: timeNow,
      description: 'One-piece nitride-hardened forged steel crankshaft with integral vibration damper.',
      actionAdvice: crankStatus !== 'NORMAL' ? 'Perform dynamic propeller vibration balance analysis' : 'Resonant harmonic damping nominal',
      meshHighlightColor: crankColor,
      rulHours: crankRul,
      degradationStatus: crankStatus !== 'NORMAL' ? 'Degradation detected' : 'Stable',
      trendRate: crankStatus !== 'NORMAL' ? '-3.8%/hr' : '-0.02%/hr',
    },
    sparkPlugs: {
      key: 'sparkPlugs',
      name: 'Dual Electronic Spark Plugs (8x)',
      category: 'Ignition System',
      healthPercent: plugHealth,
      temperature: `${state.cht}°C`,
      vibration: `${state.vibration} g`,
      status: plugStatus,
      relatedSensors: ['EGT', 'CHT', 'Knock Sensor'],
      lastUpdate: timeNow,
      description: 'Dual redundant inductive capacitive discharge spark plugs per cylinder for airworthiness safety.',
      actionAdvice: plugStatus !== 'NORMAL' ? 'Check spark plug electrode gap and inspect ceramic insulator' : 'Firing energy optimal',
      meshHighlightColor: plugColor,
      rulHours: plugRul,
      degradationStatus: plugStatus !== 'NORMAL' ? 'Degradation detected' : 'Stable',
      trendRate: plugStatus !== 'NORMAL' ? '-2.1%/hr' : '-0.06%/hr',
    },
    intakeSystem: {
      key: 'intakeSystem',
      name: 'Turbocharged Air Intake & Plenum',
      category: 'Air & Boost Management',
      healthPercent: intakeHealth,
      temperature: `${state.ambientTemp}°C`,
      vibration: `${(state.vibration * 0.4).toFixed(2)} g`,
      status: intakeStatus,
      relatedSensors: ['Manifold Pressure (MAP)', 'Throttle Position (TPS)', 'Ambient Pressure'],
      lastUpdate: timeNow,
      description: 'Carbon-composite intake plenum with electronic fly-by-wire throttle valve and intercooler.',
      actionAdvice: intakeStatus !== 'NORMAL' ? 'Inspect turbocharger wastegate actuator and intake clamps' : 'Boost regulation nominal',
      meshHighlightColor: intakeColor,
      rulHours: intakeRul,
      degradationStatus: intakeStatus !== 'NORMAL' ? 'Degradation detected' : 'Stable',
      trendRate: intakeStatus !== 'NORMAL' ? '-1.5%/hr' : '-0.02%/hr',
    },
    exhaustSystem: {
      key: 'exhaustSystem',
      name: 'Inconel Tuned Exhaust & Wastegate',
      category: 'Exhaust & Thermal',
      healthPercent: exhaustHealth,
      temperature: `${state.egt}°C`,
      vibration: `${state.vibration} g`,
      status: exhaustStatus,
      relatedSensors: ['EGT', 'Ambient Temp', 'Engine Load'],
      lastUpdate: timeNow,
      description: 'Equal-length Inconel 625 exhaust manifold runners feeding the integrated turbocharger turbine.',
      actionAdvice: exhaustStatus !== 'NORMAL' ? 'Verify fuel mixture enrichment and inspect exhaust flanges' : 'Thermal expansion margins nominal',
      meshHighlightColor: exhaustColor,
      rulHours: exhaustRul,
      degradationStatus: exhaustStatus !== 'NORMAL' ? 'Degradation detected' : 'Stable',
      trendRate: exhaustStatus !== 'NORMAL' ? '-3.1%/hr' : '-0.04%/hr',
    },
    coolingSystem: {
      key: 'coolingSystem',
      name: 'Dual Liquid & Air Cooling Jacket',
      category: 'Thermal Management',
      healthPercent: coolHealth,
      temperature: `${state.cht}°C`,
      vibration: `${state.vibration} g`,
      status: coolStatus,
      relatedSensors: ['CHT', 'Oil Temp', 'Ambient Temp'],
      lastUpdate: timeNow,
      description: 'Closed-loop ethylene-glycol radiator circulation with mechanical centrifugal coolant pump.',
      actionAdvice: coolStatus !== 'NORMAL' ? 'Inspect cooling airflow ducting and coolant expansion level' : 'Heat exchanger differential nominal',
      meshHighlightColor: coolColor,
      rulHours: coolRul,
      degradationStatus: coolStatus !== 'NORMAL' ? 'Degradation detected' : 'Stable',
      trendRate: coolStatus !== 'NORMAL' ? '-3.8%/hr' : '-0.03%/hr',
    },
    lubricationSystem: {
      key: 'lubricationSystem',
      name: 'Dry-Sump Scavenge & Oil Cooler',
      category: 'Fluid Lubrication',
      healthPercent: lubHealth,
      temperature: `${state.oilTemp}°C`,
      vibration: `${state.vibration} g`,
      status: lubStatus,
      relatedSensors: ['Oil Pressure', 'Oil Temperature'],
      lastUpdate: timeNow,
      description: 'Dual gerotor pressure & scavenge pumps feeding full-flow spin-on oil filter and thermostatic cooler.',
      actionAdvice: lubStatus !== 'NORMAL' ? 'Check oil reservoir level, scavenge screen and pressure relief valve' : 'Hydrodynamic wedge pressure nominal',
      meshHighlightColor: lubColor,
      rulHours: lubRul,
      degradationStatus: lubStatus !== 'NORMAL' ? 'Degradation detected' : 'Stable',
      trendRate: lubStatus !== 'NORMAL' ? '-4.5%/hr' : '-0.02%/hr',
    },
  };
}
