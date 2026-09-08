import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  Gauge,
  AlertTriangle,
  BrainCircuit,
  HeartPulse,
  Cpu,
  Bell,
  TrendingUp,
  History,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Flame,
  Droplets,
  Activity,
  Layers,
} from 'lucide-react';
import { useDemo, DEMO_SCENARIOS, DEMO_CHAIN_STAGES } from '../../context/DemoContext';
import { useEngine } from '../../context/EngineContext';
import { runAiDiagnostics } from '../../services/aiDiagnosticsEngine';
import { NavItemKey } from '../layout/Sidebar';

interface DemoModeBarProps {
  onNavigateTab?: (tab: NavItemKey) => void;
}

export const DemoModeBar: React.FC<DemoModeBarProps> = ({ onNavigateTab }) => {
  const {
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
    stopDemo,
    togglePlayPause,
    nextScenario,
    prevScenario,
    jumpToScenario,
    setPlaybackSpeed,
    setAutoAdvance,
  } = useDemo();

  const { telemetry, status, activeFaults, simulationMode, healthMetrics } = useEngine();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const aiResult = runAiDiagnostics(telemetry, simulationMode);

  if (!isDemoActive) return null;

  // Icon mapping for the 9-stage cause and effect chain
  const stageIcons = [
    Gauge,           // 1. Sensor values change
    AlertTriangle,   // 2. Fault detection
    BrainCircuit,    // 3. AI anomaly score changes
    HeartPulse,      // 4. Engine health changes
    Cpu,             // 5. Affected digital-twin component changes
    Bell,            // 6. Dashboard alert appears
    TrendingUp,      // 7. Trend graph changes
    History,         // 8. Fault history records the event
    CheckCircle2,    // 9. Recovery resolves the fault
  ];

  // Quick navigation targets for chain stages
  const getTabForStage = (index: number): NavItemKey => {
    switch (index) {
      case 0: return 'live-monitoring';
      case 1: return 'fault-detection';
      case 2: return 'ai-diagnostics';
      case 3: return 'health-performance';
      case 4: return 'digital-twin';
      case 5: return 'overview';
      case 6: return 'trends-analytics';
      case 7: return 'fault-history';
      case 8: return 'overview';
      default: return 'overview';
    }
  };

  // Scenario specific icons
  const getScenarioIcon = (id: number) => {
    switch (id) {
      case 1: return CheckCircle2;
      case 2: return Flame;
      case 3: return Droplets;
      case 4: return Activity;
      case 5: return Layers;
      case 6: return RotateCcw;
      default: return Sparkles;
    }
  };

  return (
    <section aria-label="Demo Mode Control Center" className="mb-5 rounded-xl bg-gradient-to-r from-[#110d28]/95 via-[#0e162b]/95 to-[#0c1a29]/95 border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Top Header Row with Controls */}
      <div className="px-4 py-3 bg-[#151230]/90 border-b border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Demo Mode Badge & Scenario Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            <Sparkles className="w-4 h-4 text-purple-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-mono font-bold tracking-widest text-purple-200 uppercase">
              DEMO MODE ACTIVE
            </span>
          </div>

          <div className="h-4 w-px bg-purple-500/30 hidden sm:block" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-purple-400">
                SCENARIO {currentScenario.number} OF {DEMO_SCENARIOS.length}:
              </span>
              <span className="text-sm font-bold text-white tracking-wide">
                {currentScenario.name.split('—')[1]?.trim() || currentScenario.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden md:block">
              {currentScenario.description}
            </p>
          </div>
        </div>

        {/* Center / Right Controls: Timeline Progress, Play/Pause, Speed, Auto, Exit */}
        <div className="flex items-center space-x-2 sm:space-x-3 font-mono text-xs">
          {/* Progress Bar and Timer */}
          <div className="hidden lg:flex flex-col items-end mr-2">
            <div className="flex items-center space-x-2 text-[11px] text-slate-300">
              <span className="text-purple-300 font-bold">{scenarioProgress}%</span>
              <span className="text-slate-500">•</span>
              <span>{secondsRemaining}s remaining</span>
            </div>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${scenarioProgress}%` }}
              />
            </div>
          </div>

          {/* Prev button */}
          <button
            onClick={prevScenario}
            title="Previous Scenario"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-purple-950 border border-slate-700 hover:border-purple-500/60 text-slate-200 hover:text-white transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause Demo' : 'Resume Demo'}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition shadow-sm ${
              isPlaying
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs">PLAY</span>
              </>
            )}
          </button>

          {/* Next button */}
          <button
            onClick={nextScenario}
            title="Next Scenario"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-purple-950 border border-slate-700 hover:border-purple-500/60 text-slate-200 hover:text-white transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700">
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                  playbackSpeed === spd
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Auto Advance Toggle */}
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            title="Toggle automatic advancement between scenarios"
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition hidden sm:inline-flex items-center gap-1 ${
              autoAdvance
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoAdvance ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            AUTO: {autoAdvance ? 'ON' : 'OFF'}
          </button>

          {/* Toggle Full Chain Expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Chain Details' : 'Expand Chain Details'}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Exit Demo Button */}
          <button
            onClick={stopDemo}
            title="Exit Demo Mode and Return to Normal Telemetry"
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-600/70 text-rose-200 hover:text-white transition flex items-center space-x-1 font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-[11px]">EXIT</span>
          </button>
        </div>
      </div>

      {/* Progress Line Across Entire Width */}
      <div className="w-full bg-slate-900/60 h-1 relative">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-300 ease-out"
          style={{ width: `${scenarioProgress}%` }}
        />
      </div>

      {/* Middle Row: The 6 Predefined Scenarios Timeline */}
      <div className="px-4 py-3 bg-[#0d1324]/80 border-b border-[#1f2a47]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            PREDEFINED DEMO SCENARIOS (CLICK TO JUMP)
          </span>
          <span className="text-[11px] font-mono text-purple-300">
            Current: {currentScenarioIndex + 1} / 6
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {DEMO_SCENARIOS.map((scenario, idx) => {
            const isActive = idx === currentScenarioIndex;
            const isPassed = idx < currentScenarioIndex;
            const Icon = getScenarioIcon(scenario.id);

            return (
              <button
                key={scenario.id}
                onClick={() => jumpToScenario(idx)}
                className={`p-2.5 rounded-lg text-left transition-all relative overflow-hidden group border ${
                  isActive
                    ? 'bg-gradient-to-br from-purple-950/80 to-blue-950/70 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)] ring-1 ring-purple-400'
                    : isPassed
                    ? 'bg-[#0e172a]/80 border-emerald-500/40 text-slate-300 hover:border-emerald-400'
                    : 'bg-[#0a0f1d]/70 border-[#1a2845] text-slate-400 hover:border-slate-600 hover:bg-[#0f172a]'
                }`}
              >
                {/* Active progress bar inside card */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 transition-all duration-300"
                    style={{ width: `${scenarioProgress}%` }}
                  />
                )}

                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                        : isPassed
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-600/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    SCENARIO {scenario.number}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? 'text-purple-300 animate-pulse'
                        : isPassed
                        ? 'text-emerald-400'
                        : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                </div>

                <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                  {scenario.shortName.split('. ')[1]}
                </div>

                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                  <span>{scenario.durationSeconds}s</span>
                  {isActive && <span className="text-cyan-400 font-bold">{secondsRemaining}s left</span>}
                  {isPassed && <span className="text-emerald-400 font-bold">✓ DONE</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lower Section: The Entire 9-Stage Cause-and-Effect Chain Stepper */}
      {isExpanded && (
        <div className="px-4 py-3 bg-[#080d1a]/95 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                END-TO-END CAUSE-AND-EFFECT CHAIN DEMONSTRATION
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                (Telemetry Excursion → AI Inference → 3D Mesh Reaction → Logging → Resolution)
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">ACTIVE STAGE:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold text-[11px]">
                {activeChainStageIndex + 1} / 9 : {activeChainStage.label}
              </span>
            </div>
          </div>

          {/* 9-Stage Horizontal Visual Stepper */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 relative">
            {DEMO_CHAIN_STAGES.map((stage, idx) => {
              const Icon = stageIcons[idx] || Gauge;
              const isCurrent = idx === activeChainStageIndex;
              const isPast = idx < activeChainStageIndex;
              const targetTab = getTabForStage(idx);

              return (
                <div
                  key={stage.id}
                  onClick={() => onNavigateTab && onNavigateTab(targetTab)}
                  title={`${stage.label}: Click to inspect ${targetTab} view`}
                  className={`p-2 rounded-lg border text-center transition-all relative cursor-pointer group ${
                    isCurrent
                      ? 'bg-gradient-to-b from-cyan-950/90 to-blue-950/90 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400 scale-[1.02] z-10'
                      : isPast
                      ? 'bg-[#0f1b31]/70 border-emerald-500/40 text-slate-300 hover:border-emerald-400'
                      : 'bg-[#090e1c]/70 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[9px] font-mono font-bold px-1 rounded ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950'
                          : isPast
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {isCurrent && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                    )}
                    {isPast && <span className="text-[9px] text-emerald-400 font-bold">✓</span>}
                  </div>

                  <div className="flex justify-center my-1">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isCurrent
                          ? 'text-cyan-300 animate-pulse'
                          : isPast
                          ? 'text-emerald-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </div>

                  <div
                    className={`text-[10px] font-bold leading-tight line-clamp-2 ${
                      isCurrent ? 'text-cyan-200' : isPast ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-Time Chain Status Details & Navigation Shortcuts */}
          <div className="p-3 rounded-lg bg-[#0e172a]/90 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            {/* Column 1: Active Stage Description */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                ACTIVE STAGE DETAILS
              </span>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                {activeChainStage.description}
              </p>
              <div className="text-[10px] text-purple-300 font-semibold pt-1">
                Scenario Focus: {currentScenario.digitalTwinFocus}
              </div>
            </div>

            {/* Column 2: Live Engine & AI Telemetry Readout */}
            <div className="space-y-1 bg-[#090f1d] p-2 rounded border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center justify-between">
                <span>LIVE SYSTEM VALUES</span>
                <span
                  className={`font-bold ${
                    status === 'NORMAL'
                      ? 'text-emerald-400'
                      : status === 'WARNING'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {status}
                </span>
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
                <span className="text-slate-400">CHT:</span>
                <span
                  className={`font-bold ${
                    telemetry.cht > 190 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-200'
                  }`}
                >
                  {telemetry.cht.toFixed(1)}°C
                </span>

                <span className="text-slate-400">Oil Press:</span>
                <span
                  className={`font-bold ${
                    telemetry.oilPressure < 30 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-200'
                  }`}
                >
                  {telemetry.oilPressure.toFixed(1)} PSI
                </span>

                <span className="text-slate-400">Vibration:</span>
                <span
                  className={`font-bold ${
                    telemetry.vibration > 1.8 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-200'
                  }`}
                >
                  {telemetry.vibration.toFixed(2)} g
                </span>

                <span className="text-slate-400">AI Anomaly:</span>
                <span
                  className={`font-bold ${
                    aiResult.anomalyScore > 0.6 ? 'text-rose-400 font-bold' : 'text-emerald-400'
                  }`}
                >
                  {aiResult.anomalyScore.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Column 3: Quick Navigation to verify this stage */}
            <div className="space-y-1.5 flex flex-col justify-between">
              <span className="text-[10px] uppercase text-slate-400 font-bold">
                VERIFY THIS STAGE ACROSS VIEWS:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onNavigateTab && onNavigateTab('digital-twin')}
                  className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 hover:text-white transition text-[10px] flex items-center justify-between"
                >
                  <span>3D Digital Twin</span>
                  <ArrowRight className="w-3 h-3 text-purple-400" />
                </button>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('fault-detection')}
                  className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition text-[10px] flex items-center justify-between"
                >
                  <span>Fault Detection</span>
                  <ArrowRight className="w-3 h-3 text-rose-400" />
                </button>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('ai-diagnostics')}
                  className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white transition text-[10px] flex items-center justify-between"
                >
                  <span>AI Diagnostics</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </button>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('fault-history')}
                  className="px-2 py-1 rounded bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 hover:text-white transition text-[10px] flex items-center justify-between"
                >
                  <span>Fault History</span>
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
