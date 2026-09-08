import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  EngineStatus,
  FaultSimulationMode,
  EngineState,
  EngineTelemetry,
  SensorData,
  Fault,
  DetailedFault,
  AIAnalysis,
  HealthStatus,
  EngineHealthMetrics,
  SubsystemHealthScore,
  ComponentHealth,
  DigitalTwinComponentKey,
  HistoricalData,
  TelemetryHistoryPoint,
  FaultHistoryRecord,
  FaultSeverity,
  SensorStatus,
  SensorHealthItem,
  SensorHealthStatus,
  SensorFaultMode,
  SystemSubsystems,
} from '../types/engine';
import { processSensorData, parseHardwareTelemetryPacket, ENGINE_CALIBRATION } from '../services/dataProcessing';
import { syncDigitalTwinComponents } from '../services/digitalTwinSync';
import { computeAiAnalysis } from '../services/aiDiagnosticsEngine';
import { calculateHealthStatus } from '../services/healthCalculator';
import { detectFaults } from '../services/faultDetector';

export interface EngineContextType {
  // 1. Unified Canonical Models
  engineState: EngineState;
  telemetry: EngineState; // backwards-compatible alias
  sensorData: SensorData;
  digitalTwinComponents: Record<DigitalTwinComponentKey, ComponentHealth>;
  components: Record<DigitalTwinComponentKey, ComponentHealth>; // alias
  aiAnalysis: AIAnalysis;
  healthStatus: HealthStatus;
  healthMetrics: HealthStatus; // backwards-compatible alias
  subsystemHealthList: SubsystemHealthScore[];

  // 2. Faults
  allFaults: Fault[];
  activeFaults: Fault[];
  monitoringFaults: Fault[];
  resolvedFaults: Fault[];
  selectedFault: Fault | null;
  faultHistory: FaultHistoryRecord[];

  // 3. Time Series History & Avionics Bus
  historicalData: HistoricalData[];
  history: HistoricalData[]; // backwards-compatible alias
  sensors: SensorStatus[];
  subsystems: SystemSubsystems;

  // 4. Status & Control
  status: EngineStatus;
  simulationMode: FaultSimulationMode;
  sensorFaultMode: SensorFaultMode;
  dataSource: 'SIMULATOR' | 'HARDWARE_STREAM';
  isSensorFaultActive: boolean;
  sensorFaultNotification: {
    sensorName: string;
    issue: string;
    engineImpact: string;
    status: SensorHealthStatus;
  } | null;

  // 5. Actions
  setSelectedFault: (fault: Fault | null) => void;
  setSimulationMode: (mode: FaultSimulationMode) => void;
  setSensorFaultMode: (mode: SensorFaultMode) => void;
  resetToNormal: () => void;
  resetSensorsToNormal: () => void;
  setDataSource: (source: 'SIMULATOR' | 'HARDWARE_STREAM') => void;
  ingestHardwarePacket: (packet: Record<string, any>) => void;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

// Initial Baseline Sensor Telemetry
const INITIAL_SENSOR_DATA: SensorData = {
  packetId: 1000,
  timestamp: new Date().toTimeString().split(' ')[0],
  timeSec: Math.floor(Date.now() / 1000),
  source: 'SIMULATOR',
  rpm: 2450,
  engineLoad: 68.2,
  manifoldPressure: 29.8,
  throttlePosition: 64.0,
  cht: 175.0,
  egt: 710,
  oilTemp: 95.0,
  ambientTemp: 18.4,
  oilPressure: 52.0,
  fuelPressure: 43.5,
  ambientPressure: 24.8,
  fuelFlow: 22.4,
  fuelLevel: 74.0,
  vibration: 0.80,
  crcValid: true,
  busLatencyMs: 12,
};

// Target Telemetry Reference for Smooth Interpolation
interface TargetTelemetry {
  rpm: number;
  engineLoad: number;
  manifoldPressure: number;
  throttlePosition: number;
  cht: number;
  egt: number;
  oilTemp: number;
  oilPressure: number;
  fuelFlow: number;
  vibration: number;
}

const NOMINAL_TARGET: TargetTelemetry = {
  rpm: 2450,
  engineLoad: 68.2,
  manifoldPressure: 29.8,
  throttlePosition: 64.0,
  cht: 175.0,
  egt: 710,
  oilTemp: 95.0,
  oilPressure: 52.0,
  fuelFlow: 22.4,
  vibration: 0.80,
};

// Initial Historic Sortie Event Log
const INITIAL_FAULT_HISTORY: FaultHistoryRecord[] = [
  {
    id: 'EVT-101',
    date: '2026-09-08',
    time: '14:32:08 UTC',
    flightId: 'UAV-940X-SORTIE-04',
    parameter: 'CHT',
    fault: 'High Cylinder Head Temperature Excursion',
    severity: 'CRITICAL',
    aiConfidence: 89,
    duration: '03m 15s',
    startTimeSec: Math.floor(Date.now() / 1000) - 7200,
    resolvedTimeSec: Math.floor(Date.now() / 1000) - 7005,
    status: 'RESOLVED',
    resolution: 'Airspeed increased + cooling cowl flap adjusted; thermal equilibrium restored',
    triggerValue: '198.5°C',
    timestamp: '14:32:08 UTC',
    flightTime: '00:32:08',
    faultName: 'High Cylinder Head Temperature Excursion',
    resolvedAt: '14:35:23 UTC',
  },
  {
    id: 'EVT-102',
    date: '2026-09-08',
    time: '11:40:12 UTC',
    flightId: 'UAV-940X-SORTIE-04',
    parameter: 'RPM',
    fault: 'Throttle Servo Hunting Oscillation',
    severity: 'WARNING',
    aiConfidence: 92,
    duration: '03m 45s',
    startTimeSec: Math.floor(Date.now() / 1000) - 18000,
    resolvedTimeSec: Math.floor(Date.now() / 1000) - 17775,
    status: 'RESOLVED',
    resolution: 'PID governor damping recalibrated via CAN-Bus telecommand',
    triggerValue: '2840 RPM',
    timestamp: '11:40:12 UTC',
    flightTime: '00:15:40',
    faultName: 'Throttle Servo Hunting Oscillation',
    resolvedAt: '11:43:57 UTC',
  },
  {
    id: 'EVT-103',
    date: '2026-09-07',
    time: '16:20:10 UTC',
    flightId: 'UAV-940X-SORTIE-03',
    parameter: 'Oil Temperature',
    fault: 'High Oil Temperature During High-Alpha Climb',
    severity: 'WARNING',
    aiConfidence: 86,
    duration: '04m 12s',
    startTimeSec: Math.floor(Date.now() / 1000) - 86400,
    resolvedTimeSec: Math.floor(Date.now() / 1000) - 86148,
    status: 'RESOLVED',
    resolution: 'Airspeed increased to 85 KIAS; oil cooler airflow restored',
    triggerValue: '114.0°C',
    timestamp: '16:20:10 UTC',
    flightTime: '01:12:05',
    faultName: 'High Oil Temperature During High-Alpha Climb',
    resolvedAt: '16:24:22 UTC',
  },
  {
    id: 'EVT-104',
    date: '2026-09-07',
    time: '17:05:44 UTC',
    flightId: 'UAV-940X-SORTIE-03',
    parameter: 'Vibration',
    fault: 'Propeller Dynamic Unbalance Exceedance',
    severity: 'CRITICAL',
    aiConfidence: 94,
    duration: '02m 45s',
    startTimeSec: Math.floor(Date.now() / 1000) - 82800,
    resolvedTimeSec: Math.floor(Date.now() / 1000) - 82635,
    status: 'RESOLVED',
    resolution: 'Reduced throttle to 65% MCP; post-flight dynamic balancing completed',
    triggerValue: '2.85 g',
    timestamp: '17:05:44 UTC',
    flightTime: '01:57:39',
    faultName: 'Propeller Dynamic Unbalance Exceedance',
    resolvedAt: '17:08:29 UTC',
  },
  {
    id: 'EVT-105',
    date: '2026-09-05',
    time: '09:14:30 UTC',
    flightId: 'UAV-940X-SORTIE-02',
    parameter: 'Oil Pressure',
    fault: 'Transient Cold-Start Scavenge Surge',
    severity: 'WARNING',
    aiConfidence: 90,
    duration: '00m 58s',
    startTimeSec: Math.floor(Date.now() / 1000) - 259200,
    resolvedTimeSec: Math.floor(Date.now() / 1000) - 259142,
    status: 'RESOLVED',
    resolution: 'Thermostatic bypass warmed; hydrodynamic pressure normalized',
    triggerValue: '41.2 PSI',
    timestamp: '09:14:30 UTC',
    flightTime: '00:04:12',
    faultName: 'Transient Cold-Start Scavenge Surge',
    resolvedAt: '09:15:28 UTC',
  },
];

// Generate Initial 180 Rolling History Points
const generateInitialHistory = (): HistoricalData[] => {
  const points: HistoricalData[] = [];
  const now = Date.now();
  for (let i = 180; i >= 0; i--) {
    const timeSec = now - i * 30000;
    const date = new Date(timeSec);
    const timeStr = date.toTimeString().split(' ')[0];

    const isHistoricEvent = i >= 120 && i <= 126;
    const baseCht = isHistoricEvent ? 188.5 + (Math.random() - 0.5) * 3 : 175.0 + (Math.random() - 0.5) * 1.5;
    const baseOilP = isHistoricEvent ? 44.0 + (Math.random() - 0.5) * 2 : 52.0 + (Math.random() - 0.5) * 1.5;
    const baseVib = isHistoricEvent ? 1.35 + (Math.random() - 0.5) * 0.1 : 0.80 + (Math.random() - 0.5) * 0.08;

    points.push({
      timestamp: timeStr,
      timeSec: Math.floor(timeSec / 1000),
      rpm: Math.round(2450 + (Math.random() - 0.5) * 20),
      engineLoad: Number((68.2 + (Math.random() - 0.5) * 1.2).toFixed(1)),
      manifoldPressure: Number((29.8 + (Math.random() - 0.5) * 0.4).toFixed(1)),
      throttlePosition: Number((64.0 + (Math.random() - 0.5) * 0.5).toFixed(1)),
      cht: Number(baseCht.toFixed(1)),
      egt: Math.round(710 + (Math.random() - 0.5) * 6),
      oilTemp: Number((95.0 + (Math.random() - 0.5) * 1.2).toFixed(1)),
      ambientTemp: 18.4,
      oilPressure: Number(baseOilP.toFixed(1)),
      fuelPressure: Number((43.5 + (Math.random() - 0.5) * 0.6).toFixed(1)),
      ambientPressure: 24.8,
      fuelFlow: Number((22.4 + (Math.random() - 0.5) * 0.5).toFixed(1)),
      fuelLevel: Number((74.0 - (180 - i) * 0.02).toFixed(1)),
      vibration: Number(baseVib.toFixed(2)),
      engineTorque: 242,
      propellerRpm: 1008,

      rpmAi: 2450,
      chtAi: 175.0,
      egtAi: 710,
      oilPressureAi: 52.0,
      vibrationAi: 0.80,

      rpmExpected: 2450,
      chtExpected: 170.0,
      egtExpected: 710,
      oilPressureExpected: 52.0,
      vibrationExpected: 0.80,

      isAnomaly: isHistoricEvent,
      isFault: false,
      faultName: isHistoricEvent ? 'Climbout Thermal Excursion' : undefined,
    });
  }
  return points;
};

export const EngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Modes & Sources
  const [simulationMode, setSimulationModeState] = useState<FaultSimulationMode>('NORMAL');
  const [sensorFaultMode, setSensorFaultMode] = useState<SensorFaultMode>('NONE');
  const [dataSource, setDataSource] = useState<'SIMULATOR' | 'HARDWARE_STREAM'>('SIMULATOR');

  // Selected Fault for Modal Inspection
  const [selectedFault, setSelectedFault] = useState<Fault | null>(null);

  // Targets for Smooth Interpolation
  const targetTelemetryRef = useRef<TargetTelemetry>({ ...NOMINAL_TARGET });

  // 1. Raw Transducer Telemetry (Sensor Data stage)
  const [rawSensorData, setRawSensorData] = useState<SensorData>(INITIAL_SENSOR_DATA);

  // 2. Canonical Engine State (Engine State stage)
  const [engineState, setEngineState] = useState<EngineState>(() =>
    processSensorData(INITIAL_SENSOR_DATA)
  );

  // 3. Faults & Lifecycle Lists
  const [allFaults, setAllFaults] = useState<Fault[]>([
    {
      id: 'FLT-098',
      detectionTime: '14:15:22',
      parameter: 'EGT',
      name: 'Transient Exhaust Gas Temperature Excursion',
      currentValue: '752°C',
      expectedValue: '710°C',
      expectedRange: '680–740°C',
      deviation: '+42°C',
      severity: 'WARNING',
      aiConfidence: 84,
      state: 'RESOLVED',
      possibleCauses: [
        'High engine continuous climb load',
        'Slight lean mixture bias on Cylinder #2 injector',
        'Cooling air stagnation at low groundspeed climbout',
        'Sensor thermocouple response latency',
      ],
      affectedSystem: 'Cylinder #2 Exhaust Runner & Manifold',
      recommendedInvestigation: [
        'Review flight log for high-climb angles',
        'Inspect exhaust gasket seal for carbon tracking',
        'Verify fuel mixture enrichment on throttle application',
      ],
      resolvedTime: '14:18:40',
      status: 'RESOLVED',
    },
  ]);

  // 4. Rolling Historical Data (360 points max)
  const [history, setHistory] = useState<HistoricalData[]>(generateInitialHistory);

  // 5. Fault History Records
  const [faultHistory, setFaultHistory] = useState<FaultHistoryRecord[]>(INITIAL_FAULT_HISTORY);

  // ==========================================================================
  // PIPELINE STAGES 3 TO 6 (Synchronized from EngineState)
  // ==========================================================================

  // Stage 3: Digital Twin Component Mapping (Engine State → Digital Twin)
  const digitalTwinComponents = useMemo(
    () => syncDigitalTwinComponents(engineState),
    [engineState]
  );

  // Stage 4: AI Analysis & Diagnostics (Engine State → AI Analysis)
  const aiAnalysis = useMemo(
    () => computeAiAnalysis(engineState, simulationMode),
    [engineState, simulationMode]
  );

  // Stage 5: Fault Detection (Engine State + AI → Fault Detection)
  const activeFaults = useMemo(
    () => allFaults.filter((f) => f.state === 'ACTIVE'),
    [allFaults]
  );
  const monitoringFaults = useMemo(
    () => allFaults.filter((f) => f.state === 'MONITORING'),
    [allFaults]
  );
  const resolvedFaults = useMemo(
    () => allFaults.filter((f) => f.state === 'RESOLVED'),
    [allFaults]
  );

  // Global Engine Status
  const status: EngineStatus = useMemo(() => {
    if (activeFaults.some((f) => f.severity === 'CRITICAL')) return 'FAULT';
    if (activeFaults.some((f) => f.severity === 'WARNING')) return 'WARNING';
    return 'NORMAL';
  }, [activeFaults]);

  // Stage 6: Health Calculation & Predictive Degradation (Engine State + AI + Twin → Health)
  const healthStatus = useMemo(() => {
    const calc = calculateHealthStatus(engineState, aiAnalysis, digitalTwinComponents, activeFaults);
    return {
      ...calc,
      resolvedFaultCount: resolvedFaults.length,
    };
  }, [engineState, aiAnalysis, digitalTwinComponents, activeFaults, resolvedFaults.length]);

  const subsystemHealthList = useMemo(
    () => healthStatus.subsystems,
    [healthStatus.subsystems]
  );

  // ==========================================================================
  // SENSOR BUS & TRANSDUCER INTEGRITY
  // ==========================================================================
  const isSensorFaultActive = sensorFaultMode !== 'NONE';

  const sensorFaultNotification = useMemo(() => {
    switch (sensorFaultMode) {
      case 'CHT_SENSOR_OFFLINE':
        return {
          sensorName: 'CHT Sensor',
          issue: 'Open-circuit / wire harness disconnect detected on Cylinder Head Type-K thermocouple',
          engineImpact: 'Engine mechanics operating normally. Dual-channel auto-fallback enabled.',
          status: 'OFFLINE' as SensorHealthStatus,
        };
      case 'VIBRATION_SENSOR_DEGRADED':
        return {
          sensorName: 'Vibration Sensor',
          issue: 'Shielding noise & CRC error rate 2.4% detected on tri-axial accelerometer',
          engineImpact: 'Dynamic balance verified normal via crankshaft hall sensor harmonics.',
          status: 'DEGRADED' as SensorHealthStatus,
        };
      case 'FUEL_SENSOR_OFFLINE':
        return {
          sensorName: 'Fuel Sensor',
          issue: 'Ultrasonic tank sender bus carrier signal loss / CAN bus timeout',
          engineImpact: 'Engine running normally. Totalizer consumption estimation active.',
          status: 'OFFLINE' as SensorHealthStatus,
        };
      case 'OIL_PRESSURE_SENSOR_DRIFT':
        return {
          sensorName: 'Oil Pressure Sensor',
          issue: 'Piezoresistive transducer baseline voltage drift (+12 PSI positive offset)',
          engineImpact: 'Oil scavenging and dry-sump level verified normal via secondary thermistor.',
          status: 'DEGRADED' as SensorHealthStatus,
        };
      default:
        return null;
    }
  }, [sensorFaultMode]);

  const sensors: SensorStatus[] = useMemo(() => {
    const isChtOffline = sensorFaultMode === 'CHT_SENSOR_OFFLINE';
    const isVibDegraded = sensorFaultMode === 'VIBRATION_SENSOR_DEGRADED';
    const isFuelOffline = sensorFaultMode === 'FUEL_SENSOR_OFFLINE';
    const isOilPDrift = sensorFaultMode === 'OIL_PRESSURE_SENSOR_DRIFT';

    return [
      {
        id: 'sens-cht',
        name: 'CHT Sensor',
        parameter: 'Cylinder Head Temperature',
        status: isChtOffline ? 'OFFLINE' : 'ONLINE',
        dataQuality: isChtOffline ? 0 : 99,
        lastUpdate: isChtOffline ? 'TIMEOUT (24s)' : '12ms ago',
        signalStatus: isChtOffline ? 'OPEN CIRCUIT / WIRE DISCONNECT' : 'NOMINAL (Dual CAN-Bus Type-K ADC)',
        busProtocol: 'CAN 2.0B / 50Hz',
        isFaulted: isChtOffline,
        faultType: isChtOffline ? 'OPEN_CIRCUIT' : undefined,
        aiSyntheticActive: isChtOffline,
        remedyAction: isChtOffline ? 'Inspect Cylinder Head Type-K thermocouple harness connector & grounding wire' : undefined,
      },
      {
        id: 'sens-egt',
        name: 'EGT Sensor',
        parameter: 'Exhaust Gas Temperature',
        status: 'ONLINE',
        dataQuality: 98,
        lastUpdate: '14ms ago',
        signalStatus: 'NOMINAL (Inconel Sheath RTD)',
        busProtocol: 'CAN 2.0B / 50Hz',
        isFaulted: false,
      },
      {
        id: 'sens-oil-temp',
        name: 'Oil Temperature Sensor',
        parameter: 'Oil Temperature',
        status: 'ONLINE',
        dataQuality: 99,
        lastUpdate: '18ms ago',
        signalStatus: 'NOMINAL (PT100 RTD 4-20mA)',
        busProtocol: 'Analog ADC 0-5V',
        isFaulted: false,
      },
      {
        id: 'sens-oil-press',
        name: 'Oil Pressure Sensor',
        parameter: 'Oil Pressure',
        status: isOilPDrift ? 'DEGRADED' : 'ONLINE',
        dataQuality: isOilPDrift ? 64 : 99,
        lastUpdate: isOilPDrift ? '18ms ago' : '10ms ago',
        signalStatus: isOilPDrift ? 'CALIBRATION DRIFT (+12 PSI Transducer Bias)' : 'NOMINAL (Piezoresistive Diaphragm)',
        busProtocol: 'Analog ADC 0-5V',
        isFaulted: isOilPDrift,
        faultType: isOilPDrift ? 'CALIBRATION_DRIFT' : undefined,
        remedyAction: isOilPDrift ? 'Perform zero-point voltage calibration on oil pressure sensor transducer' : undefined,
      },
      {
        id: 'sens-rpm',
        name: 'RPM Sensor',
        parameter: 'Engine Rotational Speed',
        status: 'ONLINE',
        dataQuality: 100,
        lastUpdate: '8ms ago',
        signalStatus: 'NOMINAL (Dual Hall-Effect Magnetic Pickup)',
        busProtocol: 'Differential Pulse TTL',
        isFaulted: false,
      },
      {
        id: 'sens-vib',
        name: 'Vibration Sensor',
        parameter: 'Engine Vibration',
        status: isVibDegraded ? 'DEGRADED' : 'ONLINE',
        dataQuality: isVibDegraded ? 72 : 97,
        lastUpdate: isVibDegraded ? '48ms ago' : '15ms ago',
        signalStatus: isVibDegraded ? 'SIGNAL NOISE (Cable Shielding EMI / CRC Error 2.4%)' : 'NOMINAL (Tri-Axial Piezoelectric Accelerometer)',
        busProtocol: 'SPI Bus / 1kHz',
        isFaulted: isVibDegraded,
        faultType: isVibDegraded ? 'SIGNAL_NOISE' : undefined,
        remedyAction: isVibDegraded ? 'Inspect tri-axial accelerometer shielding braid and grounding ground loop' : undefined,
      },
      {
        id: 'sens-fuel',
        name: 'Fuel Sensor',
        parameter: 'Fuel Flow & Tank Level',
        status: isFuelOffline ? 'OFFLINE' : 'ONLINE',
        dataQuality: isFuelOffline ? 0 : 98,
        lastUpdate: isFuelOffline ? 'TIMEOUT (18s)' : '25ms ago',
        signalStatus: isFuelOffline ? 'BUS TIMEOUT (Ultrasonic Transceiver Loss)' : 'NOMINAL (Optical Flow Turbine + Ultrasonic Sender)',
        busProtocol: 'CAN 2.0B / 20Hz',
        isFaulted: isFuelOffline,
        faultType: isFuelOffline ? 'BUS_TIMEOUT' : undefined,
        aiSyntheticActive: isFuelOffline,
        remedyAction: isFuelOffline ? 'Cycle CAN-Bus transceiver power rail or check optical flow sensor turbine wheel' : undefined,
      },
      {
        id: 'sens-map',
        name: 'Manifold Pressure Sensor',
        parameter: 'Manifold Air Pressure (MAP)',
        status: 'ONLINE',
        dataQuality: 99,
        lastUpdate: '12ms ago',
        signalStatus: 'NOMINAL (Absolute Piezoresistive MAP)',
        busProtocol: 'Analog ADC 0-5V',
        isFaulted: false,
      },
    ];
  }, [sensorFaultMode]);

  const subsystems: SystemSubsystems = useMemo(
    () => ({
      sensorSystem: isSensorFaultActive ? 'DEGRADED' : 'ONLINE',
      dataStream: 'ONLINE',
      aiModel: 'ONLINE',
      digitalTwin: 'ONLINE',
      database: 'ONLINE',
    }),
    [isSensorFaultActive]
  );

  // ==========================================================================
  // HARDWARE STREAM & SIMULATION CONTROLS
  // ==========================================================================

  // Ingest hardware telemetry from ESP32 / Raspberry Pi / MQTT broker
  const ingestHardwarePacket = (packet: Record<string, any>) => {
    const raw = parseHardwareTelemetryPacket(packet);
    setRawSensorData(raw);
    setEngineState((prev) => processSensorData(raw, prev));
  };

  // Switch simulation mode
  const setSimulationMode = (mode: FaultSimulationMode) => {
    setSimulationModeState(mode);

    if (mode === 'NORMAL') {
      targetTelemetryRef.current = { ...NOMINAL_TARGET };
      const resolveTime = new Date().toTimeString().split(' ')[0] + ' UTC';
      const nowSec = Math.floor(Date.now() / 1000);

      // Transition active faults to RESOLVED
      setAllFaults((prev) =>
        prev.map((f) =>
          f.state === 'ACTIVE' || f.state === 'MONITORING'
            ? { ...f, state: 'RESOLVED', status: 'RESOLVED', resolvedTime: resolveTime }
            : f
        )
      );

      // Mark active records in faultHistory as RESOLVED
      setFaultHistory((prev) =>
        prev.map((rec) => {
          if (rec.status === 'ACTIVE' || rec.status === 'MONITORING') {
            const elapsed = Math.max(1, nowSec - rec.startTimeSec);
            return {
              ...rec,
              status: 'RESOLVED' as const,
              resolvedTimeSec: nowSec,
              resolvedAt: resolveTime,
              duration: `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
              resolution: 'Reset to normal operation; thermal & pressure baselines recovered',
            };
          }
          return rec;
        })
      );
      return;
    }

    // Set target telemetry for chosen fault
    switch (mode) {
      case 'HIGH_CHT':
        targetTelemetryRef.current = {
          ...NOMINAL_TARGET,
          cht: 206.0,
          oilTemp: 104.0,
          engineLoad: 78.5,
        };
        break;
      case 'LOW_OIL_PRESS':
        targetTelemetryRef.current = {
          ...NOMINAL_TARGET,
          oilPressure: 24.0,
          oilTemp: 118.0,
        };
        break;
      case 'HIGH_OIL_TEMP':
        targetTelemetryRef.current = {
          ...NOMINAL_TARGET,
          oilTemp: 126.0,
          oilPressure: 38.0,
        };
        break;
      case 'ABNORMAL_VIBRATION':
        targetTelemetryRef.current = {
          ...NOMINAL_TARGET,
          vibration: 3.80,
        };
        break;
      case 'ABNORMAL_EGT':
        targetTelemetryRef.current = {
          ...NOMINAL_TARGET,
          egt: 840,
          fuelFlow: 27.2,
        };
        break;
      case 'RPM_INSTABILITY':
        targetTelemetryRef.current = {
          ...NOMINAL_TARGET,
          rpm: 2840,
          throttlePosition: 72.0,
        };
        break;
      case 'MULTIPLE_FAULT':
        targetTelemetryRef.current = {
          ...NOMINAL_TARGET,
          rpm: 2710,
          cht: 208.0,
          egt: 825,
          oilTemp: 124.0,
          oilPressure: 22.0,
          vibration: 3.90,
          fuelFlow: 28.5,
          manifoldPressure: 34.2,
          engineLoad: 88.0,
        };
        break;
    }

    // Every fault generated by the simulator should automatically be recorded in fault history
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0] + ' UTC';
    const nowSec = Math.floor(now.getTime() / 1000);

    const createHistoryRec = (
      param: string,
      faultName: string,
      sev: FaultSeverity,
      conf: number,
      trig: string
    ): FaultHistoryRecord => ({
      id: `EVT-${Date.now().toString().slice(-4)}`,
      date: dateStr,
      time: timeStr,
      flightId: 'UAV-940X-SORTIE-04',
      parameter: param,
      fault: faultName,
      severity: sev,
      aiConfidence: conf,
      duration: '00m 01s (Active)',
      startTimeSec: nowSec,
      status: 'ACTIVE',
      resolution: 'Excursion active; autonomous investigation in progress',
      triggerValue: trig,
      timestamp: timeStr,
      flightTime: '01:42:38',
      faultName,
    });

    const newRecs: FaultHistoryRecord[] = [];
    if (mode === 'HIGH_CHT') {
      newRecs.push(createHistoryRec('CHT', 'High Cylinder Head Temperature Excursion', 'CRITICAL', 91, '206.0°C'));
    } else if (mode === 'LOW_OIL_PRESS') {
      newRecs.push(createHistoryRec('Oil Pressure', 'Low Engine Oil Pressure Scavenge Drop', 'CRITICAL', 96, '24.0 PSI'));
    } else if (mode === 'HIGH_OIL_TEMP') {
      newRecs.push(createHistoryRec('Oil Temperature', 'High Oil Reservoir Over-Temperature', 'WARNING', 89, '126.0°C'));
    } else if (mode === 'ABNORMAL_VIBRATION') {
      newRecs.push(createHistoryRec('Vibration', 'Abnormal Tri-Axial Mechanical Vibration', 'CRITICAL', 94, '3.80 g'));
    } else if (mode === 'ABNORMAL_EGT') {
      newRecs.push(createHistoryRec('EGT', 'Exhaust Gas Temperature Thermal Runaway', 'CRITICAL', 93, '840°C'));
    } else if (mode === 'RPM_INSTABILITY') {
      newRecs.push(createHistoryRec('RPM', 'Propulsion Speed & Governor Hunting Instability', 'WARNING', 87, '2840 RPM'));
    } else if (mode === 'MULTIPLE_FAULT') {
      newRecs.push(createHistoryRec('CHT', 'High Cylinder Head Temperature Excursion', 'CRITICAL', 92, '208.0°C'));
      newRecs.push(createHistoryRec('Oil Pressure', 'Low Engine Oil Pressure Scavenge Drop', 'CRITICAL', 96, '22.0 PSI'));
      newRecs.push(createHistoryRec('Vibration', 'Abnormal Tri-Axial Mechanical Vibration', 'CRITICAL', 95, '3.90 g'));
    }

    if (newRecs.length > 0) {
      setFaultHistory((prev) => [...newRecs, ...prev]);
    }
  };

  const resetToNormal = () => {
    setSimulationMode('NORMAL');
  };

  const resetSensorsToNormal = () => {
    setSensorFaultMode('NONE');
  };

  // ==========================================================================
  // CENTRALIZED ENGINE SIMULATION & PROCESSING TICKER (Runs Every 1 Second)
  // Executes the exact pipeline:
  // Sensor Data → Data Processing → Engine State → Digital Twin → AI Analysis → Health Calculation → Fault Detection → Dashboard
  // ==========================================================================
  useEffect(() => {
    if (dataSource === 'HARDWARE_STREAM') return;

    const interval = setInterval(() => {
      setRawSensorData((prevRaw) => {
        const target = targetTelemetryRef.current;
        const lerpFactor = 0.15; // Smooth realistic thermal/fluid inertia

        const isRpmHunting = simulationMode === 'RPM_INSTABILITY';
        const rpmOffset = isRpmHunting ? Math.sin(Date.now() / 400) * 380 : 0;
        const newRpm = Math.round(
          prevRaw.rpm + (target.rpm + rpmOffset - prevRaw.rpm) * lerpFactor + (Math.random() - 0.5) * 16
        );

        const newCht = Number(
          (prevRaw.cht + (target.cht - prevRaw.cht) * lerpFactor + (Math.random() - 0.5) * 0.8).toFixed(1)
        );

        const newEgt = Math.round(
          prevRaw.egt + (target.egt - prevRaw.egt) * lerpFactor + (Math.random() - 0.5) * 3
        );

        const newOilTemp = Number(
          (prevRaw.oilTemp + (target.oilTemp - prevRaw.oilTemp) * lerpFactor + (Math.random() - 0.5) * 0.4).toFixed(1)
        );

        const newOilPressure = Number(
          (prevRaw.oilPressure + (target.oilPressure - prevRaw.oilPressure) * lerpFactor + (Math.random() - 0.5) * 0.3).toFixed(1)
        );

        const newVibration = Number(
          Math.max(
            0.1,
            prevRaw.vibration + (target.vibration - prevRaw.vibration) * lerpFactor + (Math.random() - 0.5) * 0.04
          ).toFixed(2)
        );

        const newFuelFlow = Number(
          (prevRaw.fuelFlow + (target.fuelFlow - prevRaw.fuelFlow) * lerpFactor + (Math.random() - 0.5) * 0.2).toFixed(1)
        );

        const newMap = Number(
          (prevRaw.manifoldPressure + (target.manifoldPressure - prevRaw.manifoldPressure) * lerpFactor + (Math.random() - 0.5) * 0.15).toFixed(1)
        );

        const newLoad = Number(
          (prevRaw.engineLoad + (target.engineLoad - prevRaw.engineLoad) * lerpFactor + (Math.random() - 0.5) * 0.4).toFixed(1)
        );

        const newThrottle = Number(
          (prevRaw.throttlePosition + (target.throttlePosition - prevRaw.throttlePosition) * lerpFactor + (Math.random() - 0.5) * 0.2).toFixed(1)
        );

        const nowSec = Math.floor(Date.now() / 1000);
        const timeStr = new Date().toTimeString().split(' ')[0];

        // 1. New Raw Sensor Data Packet
        const nextRaw: SensorData = {
          ...prevRaw,
          packetId: prevRaw.packetId + 1,
          timestamp: timeStr,
          timeSec: nowSec,
          rpm: newRpm,
          engineLoad: newLoad,
          manifoldPressure: newMap,
          throttlePosition: newThrottle,
          cht: newCht,
          egt: newEgt,
          oilTemp: newOilTemp,
          oilPressure: newOilPressure,
          vibration: newVibration,
          fuelFlow: newFuelFlow,
        };

        // 2. Process into Canonical Engine State
        setEngineState((prevEngine) => {
          const nextEngine = processSensorData(nextRaw, prevEngine);

          // 3. Evaluate Faults using faultDetector
          setAllFaults((prevFaults) => {
            const tempAi = computeAiAnalysis(nextEngine, simulationMode);
            return detectFaults(nextEngine, prevFaults, tempAi, simulationMode);
          });

          // 4. Update Rolling Historical Buffer
          setHistory((prevHist) => {
            const isFaultActive = simulationMode !== 'NORMAL';
            const chtAi = isFaultActive ? Number((172.5 + (nextEngine.cht - 172.5) * 0.25).toFixed(1)) : nextEngine.cht;
            const oilPressureAi = isFaultActive ? Number((51.5 - (51.5 - nextEngine.oilPressure) * 0.2).toFixed(1)) : nextEngine.oilPressure;
            const vibrationAi = isFaultActive ? Number((0.85 + (nextEngine.vibration - 0.85) * 0.2).toFixed(2)) : nextEngine.vibration;

            const isAnomaly =
              nextEngine.cht >= 186 ||
              nextEngine.oilPressure <= 42 ||
              nextEngine.vibration >= 1.4 ||
              nextEngine.egt >= 750 ||
              simulationMode === 'RPM_INSTABILITY';

            const isFault =
              nextEngine.cht >= 195 ||
              nextEngine.oilPressure <= 30 ||
              nextEngine.vibration >= 2.0 ||
              nextEngine.egt >= 780 ||
              simulationMode === 'MULTIPLE_FAULT';

            const faultName = isFault
              ? simulationMode === 'HIGH_CHT'
                ? 'High Cylinder Temperature Excursion'
                : simulationMode === 'LOW_OIL_PRESS'
                ? 'Low Engine Oil Pressure Drop'
                : simulationMode === 'ABNORMAL_VIBRATION'
                ? 'High Mechanical Vibration'
                : simulationMode === 'ABNORMAL_EGT'
                ? 'Exhaust Thermal Runaway'
                : simulationMode === 'MULTIPLE_FAULT'
                ? 'Cascading Propulsion Failure'
                : 'Active Telemetry Fault'
              : undefined;

            const keepLength = 360;
            const trimmed = prevHist.length >= keepLength ? prevHist.slice(1) : prevHist;

            return [
              ...trimmed,
              {
                timestamp: timeStr,
                timeSec: nowSec,
                rpm: nextEngine.rpm,
                engineLoad: nextEngine.engineLoad,
                manifoldPressure: nextEngine.manifoldPressure,
                throttlePosition: nextEngine.throttlePosition,
                cht: nextEngine.cht,
                egt: nextEngine.egt,
                oilTemp: nextEngine.oilTemp,
                ambientTemp: nextEngine.ambientTemp,
                oilPressure: nextEngine.oilPressure,
                fuelPressure: nextEngine.fuelPressure,
                ambientPressure: nextEngine.ambientPressure,
                fuelFlow: nextEngine.fuelFlow,
                fuelLevel: nextEngine.fuelLevel,
                vibration: nextEngine.vibration,
                engineTorque: nextEngine.engineTorque,
                propellerRpm: nextEngine.propellerRpm,

                rpmAi: nextEngine.rpm,
                chtAi,
                egtAi: isFaultActive ? 718 : nextEngine.egt,
                oilPressureAi,
                vibrationAi,

                rpmExpected: 2450,
                chtExpected: 170.0,
                egtExpected: 710,
                oilPressureExpected: 52.0,
                vibrationExpected: 0.80,

                isAnomaly,
                isFault,
                faultName,
              },
            ];
          });

          return nextEngine;
        });

        // 5. Update Duration of Active Faults in faultHistory
        setFaultHistory((prev) => {
          if (!prev.some((r) => r.status === 'ACTIVE')) return prev;
          const currentSec = Math.floor(Date.now() / 1000);
          return prev.map((r) => {
            if (r.status === 'ACTIVE') {
              const elapsed = Math.max(1, currentSec - r.startTimeSec);
              return {
                ...r,
                duration: `${Math.floor(elapsed / 60)}m ${elapsed % 60}s (Active)`,
              };
            }
            return r;
          });
        });

        return nextRaw;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dataSource, simulationMode]);

  return (
    <EngineContext.Provider
      value={{
        engineState,
        telemetry: engineState,
        sensorData: rawSensorData,
        digitalTwinComponents,
        components: digitalTwinComponents,
        aiAnalysis,
        healthStatus,
        healthMetrics: healthStatus,
        subsystemHealthList,
        allFaults,
        activeFaults,
        monitoringFaults,
        resolvedFaults,
        selectedFault,
        faultHistory,
        historicalData: history,
        history,
        sensors,
        subsystems,
        status,
        simulationMode,
        sensorFaultMode,
        dataSource,
        isSensorFaultActive,
        sensorFaultNotification,
        setSelectedFault,
        setSimulationMode,
        setSensorFaultMode,
        resetToNormal,
        resetSensorsToNormal,
        setDataSource,
        ingestHardwarePacket,
      }}
    >
      {children}
    </EngineContext.Provider>
  );
};

export const useEngine = () => {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within an EngineProvider');
  }
  return context;
};
