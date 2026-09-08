// ============================================================================
// FAULT DETECTION SERVICE
// Pipeline Stage: Engine State + AI Analysis → Fault Detection
// ============================================================================

import { EngineState, Fault, AIAnalysis, FaultSeverity } from '../types/engine';

/**
 * Evaluates operational exceedances against aero propulsion airworthiness thresholds.
 * Updates fault states: ACTIVE, MONITORING, and RESOLVED.
 */
export function detectFaults(
  state: EngineState,
  previousFaults: Fault[],
  ai: AIAnalysis,
  simulationMode: string = 'NORMAL'
): Fault[] {
  const timeNow = new Date().toTimeString().split(' ')[0] + ' UTC';
  let faults: Fault[] = [...previousFaults];

  // Helper to upsert a fault
  const updateOrCreateFault = (
    paramKey: string,
    isTriggered: boolean,
    severity: FaultSeverity,
    faultMeta: {
      name: string;
      expected: string;
      expectedRange: string;
      currentValue: string;
      deviation: string;
      causes: string[];
      affectedSystem: string;
      investigation: string[];
      confidence: number;
    }
  ) => {
    const existingIdx = faults.findIndex(
      (f) => f.parameter === paramKey && f.state !== 'RESOLVED'
    );

    if (isTriggered) {
      if (existingIdx >= 0) {
        faults[existingIdx] = {
          ...faults[existingIdx],
          currentValue: faultMeta.currentValue,
          deviation: faultMeta.deviation,
          severity,
          aiConfidence: faultMeta.confidence,
          state: 'ACTIVE',
        };
      } else {
        const newFault: Fault = {
          id: `FLT-${paramKey.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`,
          detectionTime: timeNow,
          parameter: paramKey,
          name: faultMeta.name,
          currentValue: faultMeta.currentValue,
          expectedValue: faultMeta.expected,
          expectedRange: faultMeta.expectedRange,
          deviation: faultMeta.deviation,
          severity,
          aiConfidence: faultMeta.confidence,
          state: 'ACTIVE',
          possibleCauses: faultMeta.causes,
          affectedSystem: faultMeta.affectedSystem,
          recommendedInvestigation: faultMeta.investigation,
          faultName: faultMeta.name,
          status: 'ACTIVE',
        };
        faults = [newFault, ...faults];
      }
    } else if (existingIdx >= 0 && simulationMode === 'NORMAL') {
      // Mark as resolved
      faults[existingIdx] = {
        ...faults[existingIdx],
        state: 'RESOLVED',
        status: 'RESOLVED',
        resolvedTime: timeNow,
      };
    }
  };

  // 1. CHT Fault Detection (Nominal: 150-190°C)
  const isChtActive = state.cht >= 186;
  const chtSeverity: FaultSeverity = state.cht >= 195 ? 'CRITICAL' : 'WARNING';
  updateOrCreateFault('CHT', isChtActive, chtSeverity, {
    name: state.cht >= 195 ? 'High Cylinder Temperature Excursion' : 'Elevated Cylinder Head Temperature',
    expected: '170.0°C',
    expectedRange: '150–190°C',
    currentValue: `${state.cht}°C`,
    deviation: `+${(state.cht - 170).toFixed(1)}°C`,
    confidence: state.cht >= 195 ? 92 : 86,
    causes: [
      'High continuous engine climbout load',
      'Cooling airflow problem (baffle restriction or duct blockage)',
      'Abnormal combustion (pre-ignition or detonation on Cylinder #3)',
      'Mixture-related condition (lean air-fuel ratio on Cylinder #3 injector)',
      'Sensor anomaly (thermocouple wiring impedance drift)',
    ],
    affectedSystem: 'Cylinder #3 Assembly & Liquid-Air Thermal Circuit',
    investigation: [
      'Check cylinder cooling baffle rubber seals and cowling pressure differential',
      'Borescope Cylinder #3 combustion chamber and inspect spark plug tip coloration',
      'Verify electronic fuel injector #3 flow rate and pulse-width trimming',
      'Cross-check reading with secondary thermal sensor or infrared gun',
    ],
  });

  // 2. Oil Pressure Fault Detection (Nominal: 45-65 PSI)
  const isOilPActive = state.oilPressure <= 42;
  const oilPSeverity: FaultSeverity = state.oilPressure <= 30 ? 'CRITICAL' : 'WARNING';
  updateOrCreateFault('Oil Pressure', isOilPActive, oilPSeverity, {
    name: state.oilPressure <= 30 ? 'Low Engine Oil Pressure Drop' : 'Depressed Oil Scavenge Pressure',
    expected: '52.0 PSI',
    expectedRange: '45–65 PSI',
    currentValue: `${state.oilPressure} PSI`,
    deviation: `-${(52.0 - state.oilPressure).toFixed(1)} PSI`,
    confidence: state.oilPressure <= 30 ? 96 : 89,
    causes: [
      'Lubrication pump scavenge cavitation or pressure relief valve spring fatigue',
      'Dry-sump reservoir oil level depletion / external line fitting weeping',
      'High thermal breakdown reducing oil film dynamic viscosity',
      'Internal main journal bearing spalling or clearance blow-by',
      'Pressure transducer sensor line air entrapment or sensor drift',
    ],
    affectedSystem: 'Dry-Sump Lubrication Pump & Crankshaft Journal Galleries',
    investigation: [
      'Immediate power reduction and plan landing at nearest airfield',
      'Inspect dry-sump oil tank level dipstick immediately post-flight',
      'Examine oil filter element pleated paper for metallic bronze/ferrous flakes',
      'Calibrate oil pressure transducer against calibrated mechanical test gauge',
    ],
  });

  // 3. Vibration Fault Detection (Nominal: 0.4 - 1.2 g)
  const isVibActive = state.vibration >= 1.4;
  const vibSeverity: FaultSeverity = state.vibration >= 2.0 ? 'CRITICAL' : 'WARNING';
  updateOrCreateFault('Vibration', isVibActive, vibSeverity, {
    name: state.vibration >= 2.0 ? 'Excessive Engine Vibration' : 'Elevated Mechanical Vibration',
    expected: '0.80 g',
    expectedRange: '0.40–1.20 g',
    currentValue: `${state.vibration} g`,
    deviation: `+${(state.vibration - 0.80).toFixed(2)} g`,
    confidence: state.vibration >= 2.0 ? 94 : 88,
    causes: [
      'Crankshaft counterweight rotational imbalance',
      'Propeller blade pitch mismatch or tip aerodynamic asymmetry',
      'Engine mount elastomeric isolator degradation or tear',
      'Cyclic torsional torque oscillation from irregular combustion',
    ],
    affectedSystem: 'Crankshaft Assembly, Propeller Hub & Dynafocal Mounts',
    investigation: [
      'Perform dynamic propeller balancing with optical strobe accelerometers',
      'Inspect dynafocal elastomeric isolators for rubber cracking or oil soaking',
      'Inspect spark plug firing consistency and ignition coil dwell times',
    ],
  });

  // 4. EGT Fault Detection (Nominal: 680 - 740°C)
  const isEgtActive = state.egt >= 750;
  const egtSeverity: FaultSeverity = state.egt >= 780 ? 'CRITICAL' : 'WARNING';
  updateOrCreateFault('EGT', isEgtActive, egtSeverity, {
    name: state.egt >= 780 ? 'Exhaust Gas Temperature Runaway' : 'Elevated Exhaust Gas Temperature',
    expected: '710°C',
    expectedRange: '680–740°C',
    currentValue: `${state.egt}°C`,
    deviation: `+${state.egt - 710}°C`,
    confidence: state.egt >= 780 ? 94 : 87,
    causes: [
      'Excessively lean air-fuel mixture bias',
      'Retarded ignition timing causing delayed in-cylinder combustion completion',
      'Exhaust valve seat leakage or valve guide blow-by',
      'Thermocouple junction calibration degradation',
    ],
    affectedSystem: 'Exhaust Manifold Runners & Turbocharger Turbine Inflow',
    investigation: [
      'Enrichen fuel delivery trim via engine control unit',
      'Perform cylinder differential compression test (leakdown test)',
      'Borescope exhaust valve faces for thermal erosion or guttering',
    ],
  });

  return faults;
}
