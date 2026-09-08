import React, { useState, useEffect } from 'react';
import { Radio, Wifi, Clock, ShieldCheck, AlertCircle, AlertTriangle, Sparkles, Menu, X } from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { useDemo } from '../../context/DemoContext';

interface HeaderProps {
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { status, dataSource, setDataSource } = useEngine();
  const { isDemoActive, startDemo, stopDemo, currentScenario } = useDemo();
  const [time, setTime] = useState({
    utc: '',
    local: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime({
        utc: now.toISOString().slice(11, 19) + ' UTC',
        local: now.toLocaleTimeString([], { hour12: false }),
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#0b1220]/95 backdrop-blur border-b border-[#1b2a47] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 text-slate-200">
      {/* Left: Branding & Title */}
      <div className="flex items-center space-x-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg bg-[#0f192c] border border-[#1e2f50] text-slate-300 hover:text-white transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
          <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold tracking-wider text-white uppercase font-mono">
              AI-Enabled Aero Engine Digital Twin
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 rounded tracking-widest font-mono">
              v2.4-AERO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wide flex items-center gap-2">
            <span>UAV PROPULSION TELEMETRY & PREDICTIVE DIAGNOSTICS</span>
          </p>
        </div>
      </div>

      {/* Center/Right: Drone ID, Engine ID, Connection Status, LIVE Indicator, Clocks */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        {/* Prominent Demo Mode Button */}
        <button
          onClick={isDemoActive ? stopDemo : startDemo}
          title={isDemoActive ? 'Click to Exit Predefined Demo Mode' : 'Click to Launch Automated Engine Twin Demo Tour'}
          className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs flex items-center space-x-2 transition-all duration-300 shadow-md ${
            isDemoActive
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse ring-2 ring-purple-400/50'
              : 'bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-950/90 hover:from-purple-900/90 hover:to-indigo-900/90 text-purple-200 hover:text-white border-purple-500/70 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:shadow-[0_0_22px_rgba(168,85,247,0.55)]'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isDemoActive ? 'text-white animate-spin' : 'text-purple-300'}`} style={isDemoActive ? { animationDuration: '4s' } : undefined} />
          <div className="flex flex-col text-left">
            <span className="leading-tight flex items-center gap-1.5">
              <span>{isDemoActive ? 'EXIT DEMO' : 'DEMO MODE'}</span>
              {isDemoActive && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/90 text-purple-200 border border-purple-400/60">
                  SCENARIO {currentScenario.number}/6
                </span>
              )}
            </span>
            <span className="text-[9px] text-purple-300/80 font-normal hidden xl:inline">
              {isDemoActive ? currentScenario.shortName : '6 Predefined Scenarios'}
            </span>
          </div>
        </button>

        {/* Drone ID Badge */}
        <div className="bg-[#0f192c] px-2.5 py-1.5 rounded border border-[#1e2f50] flex flex-col hidden sm:flex">
          <span className="text-[9px] uppercase tracking-wider text-slate-400">Drone ID</span>
          <span className="font-semibold text-cyan-300">UAV-AP-940X</span>
        </div>

        {/* Engine ID Badge */}
        <div className="bg-[#0f192c] px-2.5 py-1.5 rounded border border-[#1e2f50] flex flex-col hidden md:flex">
          <span className="text-[9px] uppercase tracking-wider text-slate-400">Engine ID</span>
          <span className="font-semibold text-slate-200">ROTAX-916iSc-TC</span>
        </div>

        {/* Connection Status */}
        <div className="bg-[#0f192c] px-2.5 py-1.5 rounded border border-[#1e2f50] flex items-center space-x-2 hidden lg:flex">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Bus Link</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              CAN 2.0B / MAVLink <span className="text-[10px] text-slate-500">(12ms)</span>
            </span>
          </div>
        </div>

        {/* LIVE Stream Indicator */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1.5 rounded flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-emerald-300 tracking-widest">LIVE</span>
            <span className="text-[9px] text-emerald-400/80">50 Hz TELEM</span>
          </div>
        </div>

        {/* Engine Global Quick State */}
        <div
          className={`px-2.5 py-1.5 rounded border flex items-center space-x-1.5 ${
            status === 'NORMAL'
              ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
              : status === 'WARNING'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-rose-950/50 border-rose-500/60 text-rose-300 animate-pulse'
          }`}
        >
          {status === 'NORMAL' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : status === 'WARNING' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className="font-bold text-[11px] uppercase tracking-wider">
            {status === 'NORMAL' ? 'NOMINAL' : status === 'WARNING' ? 'CAUTION' : 'FAULT DETECTED'}
          </span>
        </div>

        {/* System Time Clocks */}
        <div className="bg-[#0f192c] px-3 py-1.5 rounded border border-[#1e2f50] flex items-center space-x-2.5 hidden sm:flex">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-cyan-200 tracking-wider">
              {time.utc || '00:00:00 UTC'}
            </span>
            <span className="text-[9px] text-slate-400 tracking-normal">
              LOC: {time.local || '00:00:00'}
            </span>
          </div>
        </div>

        {/* Source Toggle for hardware readiness */}
        <button
          onClick={() => setDataSource(dataSource === 'SIMULATOR' ? 'HARDWARE_STREAM' : 'SIMULATOR')}
          title="Toggle between internal simulator and external hardware stream (ESP32/Raspberry Pi/MQTT)"
          className="px-2 py-1 text-[10px] rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 hidden sm:flex"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>{dataSource === 'SIMULATOR' ? 'SIM DATA' : 'HW STREAM'}</span>
        </button>
      </div>
    </header>
  );
};
