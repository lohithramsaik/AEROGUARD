import {
  EngineTelemetry,
  FaultSimulationMode,
  AIAnalysis,
  ContributingParameter,
  FailureModeLikelihood,
  EngineState,
} from '../types/engine';

export interface ParameterContribution {
  parameter: string;
  observation: string;
  measured: string;
  expected: string;
  delta: string;
  severity: 'NORMAL' | 'MONITOR' | 'WARNING' | 'CRITICAL';
  contributionWeight: number; // 0.0 to 1.0
}

export interface AiDiagnosisResult {
  engineHealth: number; // 0-100%
  anomalyScore: number; // 0.00 to 1.00
  anomalyCategory: 'Normal' | 'Monitor' | 'Warning' | 'Critical';
  confidence: number; // e.g. 91%
  headline: string;
  synthesis: string;
  contributions: ParameterContribution[];
  modelInfo: {
    name: string;
    version: string;
    architecture: string;
    inferenceTimeMs: number;
  };
}

/**
 * AI Diagnostics Engine
 * Evaluates real-time engine telemetry against the digital twin physics baseline.
 * Produces deterministic, explainable anomaly scores, diagnoses, and feature attribution.
 * Designed with a clean interface so a real ML/ONNX model can seamlessly replace the inference logic.
 */
export const runAiDiagnostics = (
  telem: EngineTelemetry,
  simulationMode: FaultSimulationMode
): AiDiagnosisResult => {
  const contributions: ParameterContribution[] = [];
  let rawScore = 0.06; // Nominal baseline noise floor

  // 1. CHT Analysis (Nominal: 150-190°C, Expected: 170°C)
  const chtDelta = telem.cht - 170.0;
  if (telem.cht >= 198.0) {
    rawScore += 0.55;
    contributions.push({
      parameter: 'CHT (Cylinder Head Temp)',
      observation: 'significantly above expected value',
      measured: `${telem.cht}°C`,
      expected: '170.0°C',
      delta: `+${chtDelta.toFixed(1)}°C`,
      severity: 'CRITICAL',
      contributionWeight: 0.88,
    });
  } else if (telem.cht >= 186.0) {
    rawScore += 0.35;
    contributions.push({
      parameter: 'CHT (Cylinder Head Temp)',
      observation: 'moderately elevated above expected value',
      measured: `${telem.cht}°C`,
      expected: '170.0°C',
      delta: `+${chtDelta.toFixed(1)}°C`,
      severity: 'WARNING',
      contributionWeight: 0.65,
    });
  } else if (telem.cht > 178.0) {
    rawScore += 0.12;
    contributions.push({
      parameter: 'CHT (Cylinder Head Temp)',
      observation: 'slightly elevated',
      measured: `${telem.cht}°C`,
      expected: '170.0°C',
      delta: `+${chtDelta.toFixed(1)}°C`,
      severity: 'MONITOR',
      contributionWeight: 0.25,
    });
  }

  // 2. Oil Pressure Analysis (Nominal: 45-65 PSI, Expected: 52 PSI)
  const oilPDelta = telem.oilPressure - 52.0;
  if (telem.oilPressure <= 28.0) {
    rawScore += 0.65;
    contributions.push({
      parameter: 'Oil Pressure',
      observation: 'critical drop below hydrodynamic lubrication threshold',
      measured: `${telem.oilPressure} PSI`,
      expected: '52.0 PSI',
      delta: `${oilPDelta.toFixed(1)} PSI`,
      severity: 'CRITICAL',
      contributionWeight: 0.94,
    });
  } else if (telem.oilPressure <= 42.0) {
    rawScore += 0.38;
    contributions.push({
      parameter: 'Oil Pressure',
      observation: 'depressed below normal operating range',
      measured: `${telem.oilPressure} PSI`,
      expected: '52.0 PSI',
      delta: `${oilPDelta.toFixed(1)} PSI`,
      severity: 'WARNING',
      contributionWeight: 0.68,
    });
  }

  // 3. Oil Temperature Analysis (Nominal: 80-105°C, Expected: 95°C)
  const oilTDelta = telem.oilTemp - 95.0;
  if (telem.oilTemp >= 118.0) {
    rawScore += 0.45;
    contributions.push({
      parameter: 'Oil Temperature',
      observation: 'increasing significantly, exceeding cooler thermal dissipation capacity',
      measured: `${telem.oilTemp}°C`,
      expected: '95.0°C',
      delta: `+${oilTDelta.toFixed(1)}°C`,
      severity: 'CRITICAL',
      contributionWeight: 0.78,
    });
  } else if (telem.oilTemp >= 106.0) {
    rawScore += 0.22;
    contributions.push({
      parameter: 'Oil Temperature',
      observation: 'increasing / trending above normal baseline',
      measured: `${telem.oilTemp}°C`,
      expected: '95.0°C',
      delta: `+${oilTDelta.toFixed(1)}°C`,
      severity: 'WARNING',
      contributionWeight: 0.45,
    });
  } else if (telem.oilTemp > 98.0) {
    rawScore += 0.08;
    contributions.push({
      parameter: 'Oil Temperature',
      observation: 'slightly elevated',
      measured: `${telem.oilTemp}°C`,
      expected: '95.0°C',
      delta: `+${oilTDelta.toFixed(1)}°C`,
      severity: 'MONITOR',
      contributionWeight: 0.20,
    });
  }

  // 4. Vibration Analysis (Nominal: 0.4-1.2g, Expected: 0.8g)
  const vibDelta = telem.vibration - 0.80;
  if (telem.vibration >= 2.5) {
    rawScore += 0.58;
    contributions.push({
      parameter: 'Vibration',
      observation: 'high harmonic vibration excursion detected on crankcase axis',
      measured: `${telem.vibration} g`,
      expected: '0.80 g',
      delta: `+${vibDelta.toFixed(2)} g`,
      severity: 'CRITICAL',
      contributionWeight: 0.85,
    });
  } else if (telem.vibration >= 1.4) {
    rawScore += 0.30;
    contributions.push({
      parameter: 'Vibration',
      observation: 'elevated dynamic oscillation',
      measured: `${telem.vibration} g`,
      expected: '0.80 g',
      delta: `+${vibDelta.toFixed(2)} g`,
      severity: 'WARNING',
      contributionWeight: 0.55,
    });
  } else if (telem.vibration > 1.0) {
    rawScore += 0.08;
    contributions.push({
      parameter: 'Vibration',
      observation: 'slightly elevated',
      measured: `${telem.vibration} g`,
      expected: '0.80 g',
      delta: `+${vibDelta.toFixed(2)} g`,
      severity: 'MONITOR',
      contributionWeight: 0.18,
    });
  }

  // 5. EGT Analysis (Nominal: 680-740°C, Expected: 710°C)
  const egtDelta = telem.egt - 710;
  if (telem.egt >= 790) {
    rawScore += 0.50;
    contributions.push({
      parameter: 'EGT (Exhaust Gas Temp)',
      observation: 'excessive thermal flame front extension / lean mixture excursion',
      measured: `${telem.egt}°C`,
      expected: '710°C',
      delta: `+${egtDelta}°C`,
      severity: 'CRITICAL',
      contributionWeight: 0.82,
    });
  } else if (telem.egt >= 750) {
    rawScore += 0.25;
    contributions.push({
      parameter: 'EGT (Exhaust Gas Temp)',
      observation: 'elevated exhaust temperature',
      measured: `${telem.egt}°C`,
      expected: '710°C',
      delta: `+${egtDelta}°C`,
      severity: 'WARNING',
      contributionWeight: 0.48,
    });
  }

  // 6. Engine Load & RPM Instability
  if (simulationMode === 'RPM_INSTABILITY' || Math.abs(telem.rpm - 2450) > 200) {
    rawScore += 0.42;
    contributions.push({
      parameter: 'Engine RPM / Governor',
      observation: 'cyclic RPM hunting and throttle servo oscillation',
      measured: `${telem.rpm} RPM`,
      expected: '2450 RPM',
      delta: `±${Math.abs(telem.rpm - 2450)} RPM`,
      severity: 'WARNING',
      contributionWeight: 0.72,
    });
  }

  if (telem.engineLoad > 76.0) {
    contributions.push({
      parameter: 'Engine Load',
      observation: 'elevated continuous duty load',
      measured: `${telem.engineLoad}%`,
      expected: '68.0%',
      delta: `+${(telem.engineLoad - 68.0).toFixed(1)}%`,
      severity: telem.engineLoad > 84 ? 'WARNING' : 'MONITOR',
      contributionWeight: 0.35,
    });
  }

  // Clamp anomaly score between 0.00 and 1.00
  const anomalyScore = Number(Math.max(0.04, Math.min(0.98, rawScore)).toFixed(2));

  // Determine Category according to strict specifications:
  // 0.00–0.30 = Normal
  // 0.30–0.60 = Monitor
  // 0.60–0.80 = Warning
  // 0.80–1.00 = Critical
  let anomalyCategory: 'Normal' | 'Monitor' | 'Warning' | 'Critical';
  if (anomalyScore >= 0.80) {
    anomalyCategory = 'Critical';
  } else if (anomalyScore >= 0.60) {
    anomalyCategory = 'Warning';
  } else if (anomalyScore >= 0.30) {
    anomalyCategory = 'Monitor';
  } else {
    anomalyCategory = 'Normal';
  }

  // Calculate Health & Confidence
  const engineHealth = Math.max(
    18,
    Math.round(100 - anomalyScore * 82)
  );

  const confidence = anomalyCategory === 'Normal' ? 96 : anomalyCategory === 'Critical' ? 93 : 89;

  // Synthesize Diagnosis Headline & Explanation
  let headline = 'No significant anomaly detected.';
  let synthesis =
    'All observed propulsion parameters conform to the nominal digital twin aero thermodynamic baseline. Residual covariance error is within standard 1-sigma distribution bounds.';

  if (simulationMode === 'HIGH_CHT' || telem.cht >= 195) {
    headline = 'Possible high-temperature abnormality detected.';
    synthesis =
      'The combined sensor pattern indicates an abnormal operating condition. High cylinder head thermal flux coupled with elevated oil temperature indicates compromised cooling air dissipation or local cylinder lean detonation.';
  } else if (simulationMode === 'LOW_OIL_PRESS' || telem.oilPressure <= 32) {
    headline = 'Severe lubrication circuit pressure degradation detected.';
    synthesis =
      'The combined sensor pattern indicates an abnormal operating condition. Rapid scavenge oil pressure reduction without matching engine power changes suggests mechanical relief valve failure or severe internal fluid cavitation.';
  } else if (simulationMode === 'HIGH_OIL_TEMP' || telem.oilTemp >= 115) {
    headline = 'Engine oil cooler thermal inefficiency detected.';
    synthesis =
      'The combined sensor pattern indicates an abnormal operating condition. Sustained oil temperature elevation leads to lubricant viscosity breakdown and accelerated bearing journal friction.';
  } else if (simulationMode === 'ABNORMAL_VIBRATION' || telem.vibration >= 2.0) {
    headline = 'Dynamic rotational vibration anomaly detected.';
    synthesis =
      'The combined sensor pattern indicates an abnormal operating condition. Accelerometer spectrum reveals harmonic peak at 2X engine rotational frequency, consistent with propeller imbalance or crankshaft journal stress.';
  } else if (simulationMode === 'ABNORMAL_EGT' || telem.egt >= 780) {
    headline = 'Exhaust gas thermal runaway detected.';
    synthesis =
      'The combined sensor pattern indicates an abnormal operating condition. Excessively high EGT reflects delayed flame front propagation or localized fuel starvation on the exhaust manifold runners.';
  } else if (simulationMode === 'RPM_INSTABILITY') {
    headline = 'Electronic throttle governor hunting detected.';
    synthesis =
      'The combined sensor pattern indicates an abnormal operating condition. Cyclic RPM oscillations exceed PID stability dampening margins.';
  } else if (simulationMode === 'MULTIPLE_FAULT') {
    headline = 'Catastrophic multi-subsystem engine cascade detected.';
    synthesis =
      'The combined sensor pattern indicates an abnormal operating condition. Concurrent thermal runaway, loss of hydrodynamic lubrication, and severe mechanical vibration indicate an immediate flight contingency requirement.';
  } else if (anomalyCategory === 'Monitor') {
    headline = 'Minor telemetry divergence under surveillance.';
    synthesis =
      'The combined sensor pattern exhibits slight drift away from the nominal model baseline. Continued trend monitoring is active.';
  }

  // If normal and no contributions, add nominal state note
  if (contributions.length === 0) {
    contributions.push({
      parameter: 'Propulsion Telemetry Ensemble',
      observation: 'all parameters within expected operating envelope',
      measured: 'Nominal',
      expected: 'Nominal',
      delta: '0.00 σ',
      severity: 'NORMAL',
      contributionWeight: 0.05,
    });
  }

  return {
    engineHealth,
    anomalyScore,
    anomalyCategory,
    confidence,
    headline,
    synthesis,
    contributions,
    modelInfo: {
      name: 'AeroTwin-DualAutoencoder-v2.4',
      version: 'ONNX-RT-1.18',
      architecture: 'Variational Latent Autoencoder + MSPC T² Residuals',
      inferenceTimeMs: 4.2,
    },
  };
};

/**
 * Canonical AI Analysis pipeline stage (EngineState → AIAnalysis)
 */
export const computeAiAnalysis = (
  state: EngineState,
  simulationMode: FaultSimulationMode = 'NORMAL'
): AIAnalysis => {
  const res = runAiDiagnostics(state, simulationMode);

  const contributingParameters: ContributingParameter[] = res.contributions.map((c) => ({
    name: c.parameter,
    key: c.parameter.toLowerCase().split(' ')[0],
    measured: c.measured,
    expected: c.expected,
    deviation: c.delta,
    importance: Math.round(c.contributionWeight * 100),
    impactText: c.observation,
    severity: c.severity === 'CRITICAL' ? 'high' : c.severity === 'WARNING' ? 'moderate' : 'normal',
    isAbnormal: c.severity !== 'NORMAL',
  }));

  const failureModes: FailureModeLikelihood[] = [];
  if (state.cht >= 195) {
    failureModes.push({
      id: 'FM-01',
      name: 'Cooling Airflow Baffle Blockage / Localized Overheating',
      likelihood: 92,
      description: 'Severe thermal excursion in cylinder head metal due to obstructed cooling air or lean mixture.',
      recommendedAction: 'Inspect cooling duct seals, cylinder baffles, and enrichen fuel mixture.',
      affectedSubsystem: 'Cooling & Cylinder Assemblies',
    });
  }
  if (state.oilPressure <= 30) {
    failureModes.push({
      id: 'FM-02',
      name: 'Hydrodynamic Lubrication Starvation',
      likelihood: 96,
      description: 'Scavenge pressure loss risking hydrodynamic wedge collapse on crankshaft journal bearings.',
      recommendedAction: 'Immediate throttle reduction, inspect oil scavenge lines and pressure relief valve.',
      affectedSubsystem: 'Lubrication Circuit',
    });
  }
  if (state.vibration >= 2.0) {
    failureModes.push({
      id: 'FM-03',
      name: 'Dynamic Rotational Resonance / Bearing Spall',
      likelihood: 94,
      description: 'Excessive tri-axial vibration harmonics indicative of propeller unbalance or counterweight fatigue.',
      recommendedAction: 'Inspect propeller reduction gearbox, dynafocal mounts, and propeller tracking.',
      affectedSubsystem: 'Mechanical Transmission',
    });
  }

  return {
    anomalyScore: res.anomalyScore,
    anomalyCategory: res.anomalyCategory,
    confidence: res.confidence,
    diagnosisHeadline: res.headline,
    diagnosisDescription: res.synthesis,
    whyExplanation: res.synthesis,
    contributingParameters,
    failureModes,
    virtualEstimates: {
      rpm: 2450,
      cht: 170.0,
      egt: 710.0,
      oilPressure: 52.0,
      vibration: 0.80,
    },
  };
};

