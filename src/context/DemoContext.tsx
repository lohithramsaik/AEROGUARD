import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useEngine } from './EngineContext';
import { FaultSimulationMode } from '../types/engine';

export interface DemoScenario {
  id: number;
  number: number;
  name: string;
  shortName: string;
  description: string;
  simMode: FaultSimulationMode;
  durationSeconds: number;
  keyHighlights: string[];
  digitalTwinFocus: string;
  alertBannerText: string;
  activeChainStageIndex: number; // 0 to 8 corresponding to the 9 chain stages
}

export interface DemoChainStage {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const DEMO_CHAIN_STAGES: DemoChainStage[] = [
  {
    id: 'sensors',
    label: 'Sensor Values Change',
    shortLabel: '1. Sensors Change',
    description: 'Raw transducer telemetry drifts beyond expected continuous operational baseline.',
  },
  {
    id: 'detection',
    label: 'Fault Detection',
    shortLabel: '2. Fault Detected',
    description: 'Autonomous threshold surveillance registers parameter exceedance.',
  },
  {
    id: 'ai_score',
    label: 'AI Anomaly Score Changes',
    shortLabel: '3. AI Anomaly Score',
    description: 'Bayesian neural model computes elevated anomaly index (0.00 → 1.00).',
  },
  {
    id: 'health',
    label: 'Engine Health Changes',
    shortLabel: '4. Health Depleted',
    description: 'Overall and subsystem health algorithms penalize affected circuits.',
  },
  {
    id: 'twin',
    label: 'Digital-Twin Component Changes',
    shortLabel: '5. 3D Twin Highlight',
    description: '3D CAD assembly mesh illuminates affected cylinder/bearing in pulsing red.',
  },
  {
    id: 'alert',
    label: 'Dashboard Alert Appears',
    shortLabel: '6. HUD Alert',
    description: 'Master operational cockpit HUD elevates status from NORMAL to FAULT.',
  },
  {
    id: 'trend',
    label: 'Trend Graph Changes',
    shortLabel: '7. Trend Shading',
    description: 'Historical telemetry curve shades abnormal excursion region in bright red.',
  },
  {
    id: 'history',
    label: 'Fault History Records Event',
    shortLabel: '8. Log Registered',
    description: 'Immutable flight sortie log records detection time, parameter, and severity.',
  },
  {
    id: 'recovery',
    label: 'Recovery Resolves Fault',
    shortLabel: '9. Fault Resolved',
    description: 'Parameters return to nominal; active faults transition to RESOLVED.',
  },
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 1,
    number: 1,
    name: 'Scenario 1 — Normal Flight',
    shortName: '1. Normal Flight',
    description: 'All propulsion parameters remain within expected continuous cruising ranges.',
    simMode: 'NORMAL',
    durationSeconds: 15,
    keyHighlights: ['RPM: 2450 RPM (Nominal)', 'CHT: 175.0°C (Expected)', 'Oil Pressure: 52 PSI', 'Vibration: 0.80 g'],
    digitalTwinFocus: 'All 9 engine components maintain nominal titanium/alloy CAD appearance',
    alertBannerText: 'ENGINE NORMAL • ALL SYSTEMS OPTIMAL',
    activeChainStageIndex: 0,
  },
  {
    id: 2,
    number: 2,
    name: 'Scenario 2 — Increasing Temperature',
    shortName: '2. High Temp (CHT)',
    description: 'Cylinder Head Temperature gradually increases 175°C → 188°C → 206°C due to cooling airflow baffle blockage.',
    simMode: 'HIGH_CHT',
    durationSeconds: 18,
    keyHighlights: ['CHT: Escalating to 206°C (>195°C Limit)', 'Oil Temp: Trending up to 104°C', 'Engine Load: Elevated'],
    digitalTwinFocus: 'Cylinder #3 combustion head and liquid cooling jacket highlight in pulsing critical red',
    alertBannerText: 'CRITICAL FAULT: High Cylinder Head Temperature Excursion (> 200°C)',
    activeChainStageIndex: 4,
  },
  {
    id: 3,
    number: 3,
    name: 'Scenario 3 — Lubrication Problem',
    shortName: '3. Low Oil Pressure',
    description: 'Oil scavenge pressure drops 52 → 35 → 24 PSI while dry-sump oil temperature increases to 122°C.',
    simMode: 'LOW_OIL_PRESS',
    durationSeconds: 18,
    keyHighlights: ['Oil Pressure: 24.0 PSI (<30 PSI Floor)', 'Oil Temp: 110.0°C (Viscosity loss)', 'Hydrodynamic wedge starvation'],
    digitalTwinFocus: 'Crankcase scavenge galleries, oil pump, and spin-on filter canister glow in critical red',
    alertBannerText: 'CRITICAL FAULT: Low Engine Oil Scavenge Pressure (Hydrodynamic Starvation)',
    activeChainStageIndex: 5,
  },
  {
    id: 4,
    number: 4,
    name: 'Scenario 4 — Vibration Problem',
    shortName: '4. Dynamic Vibration',
    description: 'Crankcase tri-axial vibration gradually escalates from 0.8g → 1.8g → 3.8g due to dynamic propeller unbalance.',
    simMode: 'ABNORMAL_VIBRATION',
    durationSeconds: 18,
    keyHighlights: ['Vibration: Escalates to 3.80 g (>2.0 g Limit)', 'Harmonic resonance load', 'Bearing spalling fatigue'],
    digitalTwinFocus: 'Crankshaft assembly, H-beam connecting rods, and propeller reduction hub glow in critical red',
    alertBannerText: 'CRITICAL FAULT: Severe Dynamic Crankcase Vibration (Resonant Unbalance)',
    activeChainStageIndex: 6,
  },
  {
    id: 5,
    number: 5,
    name: 'Scenario 5 — Multiple Fault',
    shortName: '5. Multiple Cascade',
    description: 'Cascading multi-subsystem failure: CHT > 208°C, Oil Temp > 124°C, Oil Press drops to 22 PSI, Vibration rises to 3.9g.',
    simMode: 'MULTIPLE_FAULT',
    durationSeconds: 22,
    keyHighlights: ['Simultaneous CHT, Oil Pressure & Vibration failure', 'Engine Health: Depleted to 34%', 'AI Anomaly: 0.98'],
    digitalTwinFocus: 'Multiple engine components simultaneously pulse in critical emergency red',
    alertBannerText: 'EMERGENCY FAULT: Cascading Multi-System Propulsion Failure',
    activeChainStageIndex: 7,
  },
  {
    id: 6,
    number: 6,
    name: 'Scenario 6 — Recovery',
    shortName: '6. System Recovery',
    description: 'Return the engine gradually to normal operation. Thermal baselines recover, oil pressure normalizes, and faults resolve.',
    simMode: 'NORMAL',
    durationSeconds: 16,
    keyHighlights: ['CHT cools back down to 175°C', 'Oil Pressure restabilizes at 52 PSI', 'Vibration dampens to 0.80 g', 'All faults marked RESOLVED'],
    digitalTwinFocus: 'Digital twin meshes cool down and return to nominal CAD aerospace finish',
    alertBannerText: 'ALL FAULTS RESOLVED • PROPULSION RESTORED TO NOMINAL CRUISE',
    activeChainStageIndex: 8,
  },
];

interface DemoContextType {
  isDemoActive: boolean;
  isPlaying: boolean;
  currentScenarioIndex: number;
  currentScenario: DemoScenario;
  scenarioProgress: number; // 0 to 100%
  secondsRemaining: number;
  playbackSpeed: number; // 0.5x, 1x, 2x
  autoAdvance: boolean;
  activeChainStage: DemoChainStage;
  activeChainStageIndex: number;
  startDemo: () => void;
  stopDemo: () => void;
  togglePlayPause: () => void;
  nextScenario: () => void;
  prevScenario: () => void;
  jumpToScenario: (index: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setAutoAdvance: (auto: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setSimulationMode, resetToNormal } = useEngine();

  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [elapsedSecondsInScenario, setElapsedSecondsInScenario] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  const currentScenario = DEMO_SCENARIOS[currentScenarioIndex] || DEMO_SCENARIOS[0];

  // Dynamic chain stage calculation based on current scenario and progress within it
  const activeChainStageIndex = (() => {
    if (currentScenario.id === 1) return 0; // Nominal
    if (currentScenario.id === 6) return 8; // Recovery

    // For scenarios 2 through 5, step through stages 0 to 7 based on progress percentage
    const progressPct = elapsedSecondsInScenario / currentScenario.durationSeconds;
    const stageIdx = Math.min(7, Math.floor(progressPct * 8));
    return stageIdx;
  })();

  const activeChainStage = DEMO_CHAIN_STAGES[activeChainStageIndex] || DEMO_CHAIN_STAGES[0];

  const secondsRemaining = Math.max(
    0,
    Math.round(currentScenario.durationSeconds - elapsedSecondsInScenario)
  );

  const scenarioProgress = Math.min(
    100,
    Math.round((elapsedSecondsInScenario / currentScenario.durationSeconds) * 100)
  );

  // Synchronize the Engine Simulator with the current demo scenario
  const applyScenario = (index: number) => {
    const sc = DEMO_SCENARIOS[index];
    if (!sc) return;

    if (sc.simMode === 'NORMAL') {
      resetToNormal();
    } else {
      setSimulationMode(sc.simMode);
    }
  };

  const startDemo = () => {
    setIsDemoActive(true);
    setIsPlaying(true);
    setCurrentScenarioIndex(0);
    setElapsedSecondsInScenario(0);
    applyScenario(0);
  };

  const stopDemo = () => {
    setIsDemoActive(false);
    setIsPlaying(false);
    resetToNormal();
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const nextScenario = () => {
    const nextIdx = (currentScenarioIndex + 1) % DEMO_SCENARIOS.length;
    setCurrentScenarioIndex(nextIdx);
    setElapsedSecondsInScenario(0);
    applyScenario(nextIdx);
  };

  const prevScenario = () => {
    const prevIdx =
      (currentScenarioIndex - 1 + DEMO_SCENARIOS.length) % DEMO_SCENARIOS.length;
    setCurrentScenarioIndex(prevIdx);
    setElapsedSecondsInScenario(0);
    applyScenario(prevIdx);
  };

  const jumpToScenario = (index: number) => {
    if (index < 0 || index >= DEMO_SCENARIOS.length) return;
    setCurrentScenarioIndex(index);
    setElapsedSecondsInScenario(0);
    applyScenario(index);
  };

  // Demo Ticker Interval
  useEffect(() => {
    if (!isDemoActive || !isPlaying) return;

    const intervalMs = 1000 / playbackSpeed;
    const timer = setInterval(() => {
      setElapsedSecondsInScenario((prev) => {
        const nextSec = prev + 1;
        if (nextSec >= currentScenario.durationSeconds) {
          if (autoAdvance) {
            // Advance to next scenario
            const nextIdx = (currentScenarioIndex + 1) % DEMO_SCENARIOS.length;
            setCurrentScenarioIndex(nextIdx);
            applyScenario(nextIdx);
            return 0;
          } else {
            return currentScenario.durationSeconds;
          }
        }
        return nextSec;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isDemoActive, isPlaying, currentScenarioIndex, currentScenario, playbackSpeed, autoAdvance]);

  return (
    <DemoContext.Provider
      value={{
        isDemoActive,
        isPlaying,
        currentScenarioIndex,
        currentScenario,
        scenarioProgress,
        secondsRemaining,
        playbackSpeed,
        autoAdvance,
        activeChainStage,
        activeChainStageIndex,
        startDemo,
        stopDemo,
        togglePlayPause,
        nextScenario,
        prevScenario,
        jumpToScenario,
        setPlaybackSpeed,
        setAutoAdvance,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
