// ============================================================================
// AERO ENGINE DIGITAL TWIN - UNIFIED TYPE SYSTEM & DATA CONTRACTS
// ============================================================================

export type EngineStatus = 'NORMAL' | 'WARNING' | 'FAULT';
export type FaultSeverity = 'NORMAL' | 'WARNING' | 'CRITICAL';
export type FaultState = 'ACTIVE' | 'MONITORING' | 'RESOLVED';

export type FaultSimulationMode =
  | 'NORMAL'
  | 'HIGH_CHT'
  | 'LOW_OIL_PRESS'
  | 'HIGH_OIL_TEMP'
  | 'ABNORMAL_VIBRATION'
  | 'ABNORMAL_EGT'
  | 'RPM_INSTABILITY'
  | 'MULTIPLE_FAULT';

// ----------------------------------------------------------------------------
// 1. SENSORDATA: Raw Transducer Telemetry (Simulated or Hardware ESP32/Pi/MQTT)
// ----------------------------------------------------------------------------
export interface SensorData {
  packetId: number;
  timestamp: string;
  timeSec: number;
  source: 'SIMULATOR' | 'HARDWARE_STREAM';

  // Raw telemetry values
  rpm: number;
  engineLoad: number;
  manifoldPressure: number;
  throttlePosition: number;
  cht: number;
  egt: number;
  oilTemp: number;
  ambientTemp: number;
  oilPressure: number;
  fuelPressure: number;
  ambientPressure: number;
  fuelFlow: number;
  fuelLevel: number;
  vibration: number;

  // Signal validity flags
  crcValid: boolean;
  busLatencyMs: number;
}

// ----------------------------------------------------------------------------
// 2. ENGINESTATE: Canonical Unified Calibrated Thermodynamic & Kinematic State
// ----------------------------------------------------------------------------
export interface CylinderTelemetry {
  id: number;
  name: string;
  cht: number;
  egt: number;
  knockIndex: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface EngineState {
  // Kinematics & Propulsion
  rpm: number;
  engineLoad: number; // %
  manifoldPressure: number; // inHg
  throttlePosition: number; // %
  engineRuntime: string; // e.g. "142h 38m"
  missionTimeSeconds: number;
  propellerRpm: number; // RPM
  engineTorque: number; // Nm

  // Thermal
  cht: number; // °C
  egt: number; // °C
  oilTemp: number; // °C
  ambientTemp: number; // °C

  // Pressure
  oilPressure: number; // PSI
  fuelPressure: number; // PSI
  ambientPressure: number; // inHg

  // Fuel System
  fuelFlow: number; // L/h
  fuelLevel: number; // %
  fuelRemaining: number; // Liters
  fuelConsumption: number; // Total Liters burned

  // Mechanical Dynamics
  vibration: number; // g

  // Subsystem Cylinder Array
  cylinders: CylinderTelemetry[];

  // Global Engine Status
  status?: EngineStatus;
}

// Backwards compatibility alias
export type EngineTelemetry = EngineState;

// ----------------------------------------------------------------------------
// 3. FAULT: Structured Diagnostic Excursion Model
// ----------------------------------------------------------------------------
export interface Fault {
  id: string;
  detectionTime: string;
  parameter: string;
  name: string;
  currentValue: string;
  expectedValue: string;
  expectedRange: string;
  deviation: string;
  severity: FaultSeverity;
  aiConfidence: number;
  state: FaultState;
  possibleCauses: string[];
  affectedSystem: string;
  recommendedInvestigation: string[];
  resolvedTime?: string;
  // Aliases for compatibility
  faultName?: string;
  status?: FaultState;
}

// Backwards compatibility alias
export type DetailedFault = Fault;

// ----------------------------------------------------------------------------
// 4. AIANALYSIS: Autonomous Diagnostic Inference & Root-Cause Attribution
// ----------------------------------------------------------------------------
export interface ContributingParameter {
  name: string;
  key: string;
  measured: number | string;
  expected: number | string;
  deviation: string;
  importance: number; // SHAP / attribution score 0 - 100
  impactText: string;
  severity: 'normal' | 'moderate' | 'high';
  isAbnormal: boolean;
}

export interface FailureModeLikelihood {
  id: string;
  name: string;
  likelihood: number; // 0 - 100%
  description: string;
  recommendedAction: string;
  affectedSubsystem: string;
}

export interface AIAnalysis {
  anomalyScore: number; // 0.00 to 1.00
  anomalyCategory: 'Normal' | 'Monitor' | 'Warning' | 'Critical';
  confidence: number; // 0 to 100%
  diagnosisHeadline: string;
  diagnosisDescription: string;
  whyExplanation: string;
  contributingParameters: ContributingParameter[];
  failureModes: FailureModeLikelihood[];
  virtualEstimates: {
    rpm: number;
    cht: number;
    egt: number;
    oilPressure: number;
    vibration: number;
  };
}

// ----------------------------------------------------------------------------
// 5. HEALTHSTATUS: Overall Engine & Subsystem Health Indicators
// ----------------------------------------------------------------------------
export type SubsystemKey =
  | 'cylinder'
  | 'cooling'
  | 'lubrication'
  | 'mechanical'
  | 'fuel'
  | 'combustion';

export interface SubsystemHealthScore {
  id: SubsystemKey;
  name: string;
  category: string;
  healthPercent: number; // 0 - 100%
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  trend: 'RISING' | 'STEADY' | 'DEGRADING';
  trendRate: string;
  lastUpdate: string;
  contributingParameter: string;
  rulHours: number;
  degradationStatus: 'Degradation detected' | 'Stable' | 'Improving';
}

export interface HealthStatus {
  engineHealth: number; // 0 - 100%
  droneHealth: number; // 0 - 100%
  aiConfidence: number; // 0 - 100%
  activeFaultCount: number;
  activeWarningCount: number;
  resolvedFaultCount: number;
  subsystems: SubsystemHealthScore[];
}

// Backwards compatibility alias
export type EngineHealthMetrics = HealthStatus;

// ----------------------------------------------------------------------------
// 6. COMPONENTHEALTH: Physical 3D Digital Twin Component Assemblies
// ----------------------------------------------------------------------------
export type DigitalTwinComponentKey =
  | 'cylinders'
  | 'pistons'
  | 'connectingRods'
  | 'crankshaft'
  | 'sparkPlugs'
  | 'intakeSystem'
  | 'exhaustSystem'
  | 'coolingSystem'
  | 'lubricationSystem';

export interface ComponentHealth {
  key: DigitalTwinComponentKey;
  name: string;
  category: string;
  healthPercent: number; // 0 - 100%
  temperature: string;
  vibration: string;
  status: 'NORMAL' | 'WARNING' | 'FAULT';
  relatedSensors: string[];
  lastUpdate: string;
  description: string;
  actionAdvice?: string;
  meshHighlightColor: string; // e.g. '#22c55e' (green), '#f59e0b' (amber), '#ef4444' (red)
  rulHours: number;
  degradationStatus: 'Degradation detected' | 'Stable' | 'Improving';
  trendRate: string;
}

// ----------------------------------------------------------------------------
// 7. HISTORICALDATA: Time-Series Rolling Buffer Points
// ----------------------------------------------------------------------------
export interface HistoricalData {
  timestamp: string;
  timeSec: number;
  rpm: number;
  engineLoad: number;
  manifoldPressure: number;
  throttlePosition: number;
  cht: number;
  egt: number;
  oilTemp: number;
  ambientTemp: number;
  oilPressure: number;
  fuelPressure: number;
  ambientPressure: number;
  fuelFlow: number;
  fuelLevel: number;
  vibration: number;
  engineTorque: number;
  propellerRpm: number;

  // AI Twin estimates for key metrics
  rpmAi: number;
  chtAi: number;
  egtAi: number;
  oilPressureAi: number;
  vibrationAi: number;

  // Physics expected baseline
  rpmExpected: number;
  chtExpected: number;
  egtExpected: number;
  oilPressureExpected: number;
  vibrationExpected: number;

  isAnomaly?: boolean;
  isFault?: boolean;
  faultName?: string;
}

// Backwards compatibility alias
export type TelemetryHistoryPoint = HistoricalData;

// ----------------------------------------------------------------------------
// 8. SENSORSTATUS: Avionics Transducer Signal Integrity Model
// ----------------------------------------------------------------------------
export type SensorHealthStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export type SensorFaultMode =
  | 'NONE'
  | 'CHT_SENSOR_OFFLINE'
  | 'VIBRATION_SENSOR_DEGRADED'
  | 'FUEL_SENSOR_OFFLINE'
  | 'OIL_PRESSURE_SENSOR_DRIFT';

export interface SensorStatus {
  id: string;
  name: string;
  parameter: string;
  status: SensorHealthStatus;
  dataQuality: number; // e.g. 99, 72, 0
  lastUpdate: string; // e.g. "12ms ago", "TIMEOUT"
  signalStatus: string; // e.g. "NOMINAL", "NOISY / CRC ERR", "OPEN CIRCUIT / SIGNAL LOSS"
  busProtocol: string;
  isFaulted: boolean;
  faultType?: 'OPEN_CIRCUIT' | 'SIGNAL_NOISE' | 'CALIBRATION_DRIFT' | 'BUS_TIMEOUT';
  aiSyntheticActive?: boolean;
  remedyAction?: string;
}

// Backwards compatibility alias
export type SensorHealthItem = SensorStatus;

// ----------------------------------------------------------------------------
// 9. ADDITIONAL UTILITY MODELS
// ----------------------------------------------------------------------------
export interface LiveMetricItem {
  id: string;
  name: string;
  category: 'ENGINE' | 'TEMPERATURE' | 'PRESSURE' | 'FUEL' | 'MECHANICAL';
  unit: string;
  measured: number | string; // MEASURED / SIMULATED VALUE
  expected: number | string; // EXPECTED VALUE
  aiEstimate: number | string; // AI ESTIMATE
  expectedRange: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  trend: 'RISING' | 'FALLING' | 'STEADY';
  trendRate: string;
  delta: string;
}

export interface FaultHistoryRecord {
  id: string;
  date: string;
  time: string;
  flightId: string;
  parameter: string;
  fault: string;
  severity: FaultSeverity;
  aiConfidence: number;
  duration: string;
  startTimeSec: number;
  resolvedTimeSec?: number;
  status: FaultState;
  resolution: string;
  triggerValue?: string;
  // Compatibility aliases
  timestamp?: string;
  flightTime?: string;
  faultName?: string;
  resolvedAt?: string;
}

export interface SystemSubsystems {
  sensorSystem: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  dataStream: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  aiModel: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  digitalTwin: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  database: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}
