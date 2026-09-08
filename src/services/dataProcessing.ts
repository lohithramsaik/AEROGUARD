// ============================================================================
// DATA PROCESSING SERVICE
// Pipeline Stage: Sensor Data → Data Processing → Engine State
// ============================================================================

import { SensorData, EngineState, CylinderTelemetry } from '../types/engine';

/**
 * Standard Calibration Parameters & Limits for Rotax 916iSc Aero Engine
 */
export const ENGINE_CALIBRATION = {
  gearReductionRatio: 2.43,
  torqueFactor: 3.55,
  nominalRpm: 2450,
  nominalCht: 175.0,
  nominalEgt: 710.0,
  nominalOilPress: 52.0,
  nominalOilTemp: 95.0,
  nominalVibration: 0.80,
  nominalFuelFlow: 22.4,
  nominalMap: 29.8,
};

/**
 * Process raw sensor telemetry packet into calibrated canonical EngineState
 * Suitable for both simulated data and real ESP32 / Raspberry Pi / MQTT hardware packets.
 */
export function processSensorData(
  raw: SensorData,
  previousState?: EngineState
): EngineState {
  // 1. Sanity Filtering & Noise Rejection
  const validRpm = Math.max(0, Math.min(6000, raw.rpm));
  const validCht = Math.max(0, Math.min(300, raw.cht));
  const validEgt = Math.max(0, Math.min(1100, raw.egt));
  const validOilPress = Math.max(0, Math.min(120, raw.oilPressure));
  const validOilTemp = Math.max(0, Math.min(180, raw.oilTemp));
  const validVibration = Math.max(0, Math.min(10.0, raw.vibration));
  const validMap = Math.max(10, Math.min(50, raw.manifoldPressure));
  const validThrottle = Math.max(0, Math.min(100, raw.throttlePosition));
  const validLoad = Math.max(0, Math.min(100, raw.engineLoad));
  const validFuelFlow = Math.max(0, Math.min(60, raw.fuelFlow));

  // 2. Kinematic & Thermodynamic Calculations
  const propellerRpm = Math.round(validRpm / ENGINE_CALIBRATION.gearReductionRatio);
  const engineTorque = Math.round(validLoad * ENGINE_CALIBRATION.torqueFactor);

  // 3. Runtime & Mission Calculation
  const missionSeconds = raw.timeSec || (previousState ? previousState.missionTimeSeconds + 1 : 5325);
  const totalHours = Math.floor(missionSeconds / 3600);
  const totalMins = Math.floor((missionSeconds % 3600) / 60);
  const engineRuntime = previousState?.engineRuntime || '142h 38m';

  // 4. Fuel Integrator
  const prevFuelRem = previousState ? previousState.fuelRemaining : 38.4;
  const prevFuelBurned = previousState ? previousState.fuelConsumption : 78.2;
  const fuelBurnStep = (validFuelFlow / 3600); // burned per second
  const fuelRemaining = Math.max(0, Number((prevFuelRem - fuelBurnStep).toFixed(2)));
  const fuelConsumption = Number((prevFuelBurned + fuelBurnStep).toFixed(2));
  const fuelLevel = Math.max(0, Number(((fuelRemaining / 50.0) * 100).toFixed(1)));

  // 5. Multi-Cylinder Temperature & Knock Distribution
  // In aero piston engines, rear cylinders (Cyl #3 & #4) run slightly hotter
  const isChtHigh = validCht >= 186;
  const isChtCrit = validCht >= 195;

  const cylinders: CylinderTelemetry[] = [1, 2, 3, 4].map((id) => {
    let offsetCht = 0;
    let offsetEgt = 0;

    if (id === 3) {
      // Cylinder 3 is downstream of cooling duct (primary thermal focus)
      offsetCht = isChtHigh ? 4.5 : 2.0;
      offsetEgt = 6;
    } else if (id === 1) {
      offsetCht = -2.0;
      offsetEgt = -4;
    } else if (id === 2) {
      offsetCht = 1.0;
      offsetEgt = 8;
    } else {
      offsetCht = 0.5;
      offsetEgt = -2;
    }

    const cylCht = Number((validCht + offsetCht).toFixed(1));
    const cylEgt = Math.round(validEgt + offsetEgt);
    const knock = Number((Math.max(0.02, (id === 3 && isChtHigh ? 0.38 : 0.05))).toFixed(2));

    let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (cylCht >= 195 || knock >= 0.30) status = 'CRITICAL';
    else if (cylCht >= 186) status = 'WARNING';

    return {
      id,
      name: `Cylinder #${id}`,
      cht: cylCht,
      egt: cylEgt,
      knockIndex: knock,
      status,
    };
  });

  // 6. Global Mechanical/Thermal Status Evaluation
  let status: 'NORMAL' | 'WARNING' | 'FAULT' = 'NORMAL';
  if (validCht >= 195 || validOilPress <= 30 || validVibration >= 2.0 || validEgt >= 780) {
    status = 'FAULT';
  } else if (validCht >= 186 || validOilPress <= 42 || validVibration >= 1.4 || validEgt >= 750) {
    status = 'WARNING';
  }

  return {
    rpm: Math.round(validRpm),
    engineLoad: Number(validLoad.toFixed(1)),
    manifoldPressure: Number(validMap.toFixed(1)),
    throttlePosition: Number(validThrottle.toFixed(1)),
    engineRuntime,
    missionTimeSeconds: missionSeconds,
    propellerRpm,
    engineTorque,

    cht: Number(validCht.toFixed(1)),
    egt: Math.round(validEgt),
    oilTemp: Number(validOilTemp.toFixed(1)),
    ambientTemp: Number(raw.ambientTemp.toFixed(1)),

    oilPressure: Number(validOilPress.toFixed(1)),
    fuelPressure: Number(raw.fuelPressure.toFixed(1)),
    ambientPressure: Number(raw.ambientPressure.toFixed(1)),

    fuelFlow: Number(validFuelFlow.toFixed(1)),
    fuelLevel,
    fuelRemaining,
    fuelConsumption,

    vibration: Number(validVibration.toFixed(2)),
    cylinders,
    status,
  };
}

/**
 * Helper to parse an external MQTT/REST/Serial packet from an ESP32 or Raspberry Pi gateway
 */
export function parseHardwareTelemetryPacket(rawPayload: Record<string, any>): SensorData {
  return {
    packetId: Number(rawPayload.packetId || rawPayload.seq || Date.now()),
    timestamp: new Date().toTimeString().split(' ')[0],
    timeSec: Math.floor(Date.now() / 1000),
    source: 'HARDWARE_STREAM',
    rpm: Number(rawPayload.rpm ?? 2450),
    engineLoad: Number(rawPayload.engineLoad ?? rawPayload.load ?? 68.2),
    manifoldPressure: Number(rawPayload.manifoldPressure ?? rawPayload.map ?? 29.8),
    throttlePosition: Number(rawPayload.throttlePosition ?? rawPayload.tps ?? 64.0),
    cht: Number(rawPayload.cht ?? 175.0),
    egt: Number(rawPayload.egt ?? 710.0),
    oilTemp: Number(rawPayload.oilTemp ?? 95.0),
    ambientTemp: Number(rawPayload.ambientTemp ?? 18.4),
    oilPressure: Number(rawPayload.oilPressure ?? rawPayload.oilP ?? 52.0),
    fuelPressure: Number(rawPayload.fuelPressure ?? rawPayload.fuelP ?? 43.5),
    ambientPressure: Number(rawPayload.ambientPressure ?? 24.8),
    fuelFlow: Number(rawPayload.fuelFlow ?? rawPayload.ff ?? 22.4),
    fuelLevel: Number(rawPayload.fuelLevel ?? 78.4),
    vibration: Number(rawPayload.vibration ?? rawPayload.vib ?? 0.80),
    crcValid: rawPayload.crcValid !== false,
    busLatencyMs: Number(rawPayload.latencyMs ?? 12),
  };
}
