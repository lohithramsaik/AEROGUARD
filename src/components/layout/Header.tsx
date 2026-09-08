import React, { useState, useEffect } from 'react';
import { Radio, Wifi, Clock, ShieldCheck, AlertCircle, AlertTriangle, Sparkles, Menu, X, Info } from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { useDemo } from '../../context/DemoContext';

interface HeaderProps {
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { status, dataSource, setDataSource } = useEngine();
  const { isDemoActive, startDemo, stopDemo, currentScenario } = useDemo();
  const [time, setTime] = useState({ utc: '', local: '' });
  const [showSpecsModal, setShowSpecsModal] = useState(false);

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
      {/* Left: Clean Branding */}
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

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-wide text-white font-sans">
                AeroGuard
              </h1>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                | Aero Engine Digital Twin
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 hidden md:inline">
                Rotax 916iSc
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Streamlined Actions & Status */}
      <div className="flex items-center space-x-2.5 text-xs font-sans">
        {/* Demo Mode Button */}
        <button
          onClick={isDemoActive ? stopDemo : startDemo}
          title={isDemoActive ? 'Click to Exit Demo Mode' : 'Click to Run 6-Scenario Demo Tour'}
          className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-sm ${
            isDemoActive
              ? 'bg-purple-600 text-white border-purple-300 animate-pulse'
              : 'bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border-purple-600/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>{isDemoActive ? `Exit Demo (${currentScenario.number}/6)` : 'Demo Mode'}</span>
        </button>

        {/* Engine Status Pill */}
        <div
          className={`px-2.5 py-1 rounded-md border flex items-center space-x-1.5 font-medium ${
            status === 'NORMAL'
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : status === 'WARNING'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse'
          }`}
        >
          {status === 'NORMAL' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : status === 'WARNING' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className="text-[11px] uppercase tracking-wider font-mono font-bold">
            {status === 'NORMAL' ? 'Normal' : status === 'WARNING' ? 'Warning' : 'Fault'}
          </span>
        </div>

        {/* System Time */}
        <div className="bg-[#0f192c] px-2.5 py-1 rounded border border-[#1e2f50] text-[11px] font-mono text-slate-300 hidden sm:flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{time.utc || '00:00:00 UTC'}</span>
        </div>

        {/* Simulator / Hardware Data Source Toggle */}
        <button
          onClick={() => setDataSource(dataSource === 'SIMULATOR' ? 'HARDWARE_STREAM' : 'SIMULATOR')}
          title="Toggle data source: Internal Simulator vs External Hardware Stream (MQTT/ESP32)"
          className="px-2 py-1 text-[10px] font-mono rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition hidden md:flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>{dataSource === 'SIMULATOR' ? 'SIM' : 'HW'}</span>
        </button>

        {/* Specs & Connection Info Popover Button */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowSpecsModal(!showSpecsModal)}
            title="System Specifications & Bus Telemetry Link"
            className="p-1.5 rounded border border-[#1e2f50] bg-[#0f192c] hover:bg-[#16243d] text-slate-400 hover:text-slate-200 transition"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {showSpecsModal && (
            <div className="absolute right-0 mt-2 w-64 p-3 bg-[#0d1629] border border-[#233758] rounded-xl shadow-2xl z-50 text-[11px] font-mono space-y-2">
              <div className="flex items-center justify-between border-b border-[#1b2b48] pb-1.5 text-slate-300 font-semibold font-sans">
                <span>Avionics & Bus Details</span>
                <button
                  onClick={() => setShowSpecsModal(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Drone ID:</span>
                  <span className="text-cyan-300 font-bold">UAV-AP-940X</span>
                </div>
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="text-slate-200">Rotax 916iSc-TC</span>
                </div>
                <div className="flex justify-between">
                  <span>Bus Protocol:</span>
                  <span className="text-emerald-400">CAN 2.0B / MAVLink</span>
                </div>
                <div className="flex justify-between">
                  <span>Bus Latency:</span>
                  <span className="text-slate-200">12 ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Stream Rate:</span>
                  <span className="text-emerald-400">50 Hz LIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
