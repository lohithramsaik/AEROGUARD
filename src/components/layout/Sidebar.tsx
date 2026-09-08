import React from 'react';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Cpu,
  BrainCircuit,
  HeartPulse,
  TrendingUp,
  Wrench,
  History,
  PlaneTakeoff,
  Settings,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

export type NavItemKey =
  | 'overview'
  | 'live-monitoring'
  | 'fault-detection'
  | 'digital-twin'
  | 'ai-diagnostics'
  | 'health-performance'
  | 'trends-analytics'
  | 'predictive-maintenance'
  | 'fault-history'
  | 'flight-history'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  key: NavItemKey;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
  badgeType?: 'fault' | 'warning' | 'info';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isMobileOpen, onCloseMobile }) => {
  const { healthMetrics, activeFaults, status } = useEngine();

  const navItems: NavItemConfig[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'live-monitoring', label: 'Live Monitoring', icon: Activity },
    {
      key: 'fault-detection',
      label: 'Fault Detection',
      icon: AlertTriangle,
      badgeCount: activeFaults.length > 0 ? activeFaults.length : undefined,
      badgeType: status === 'FAULT' ? 'fault' : 'warning',
    },
    { key: 'digital-twin', label: 'Digital Twin', icon: Cpu },
    { key: 'ai-diagnostics', label: 'AI Diagnostics', icon: BrainCircuit },
    {
      key: 'health-performance',
      label: 'Health & Performance',
      icon: HeartPulse,
      badgeCount: healthMetrics.engineHealth < 80 ? Math.round(healthMetrics.engineHealth) : undefined,
      badgeType: healthMetrics.engineHealth < 60 ? 'fault' : 'warning',
    },
    { key: 'trends-analytics', label: 'Trends & Analytics', icon: TrendingUp },
    { key: 'predictive-maintenance', label: 'Predictive Maintenance', icon: Wrench },
    {
      key: 'fault-history',
      label: 'Fault History',
      icon: History,
      badgeCount: activeFaults.length > 0 ? activeFaults.length : undefined,
      badgeType: 'warning',
    },
    { key: 'flight-history', label: 'Flight History', icon: PlaneTakeoff },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 bg-[#0a0f1d] border-r border-[#1a2845] flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header / Context */}
        <div className="p-3 border-b border-[#1a2845]/70 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 font-semibold mb-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>SYSTEM VIEWS</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Engine Status:</span>
              <span className="text-emerald-400 font-semibold">Online</span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded text-slate-400 hover:text-white"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/40 text-cyan-300 border-l-2 border-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121c32]/60'
                }`}
              >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badgeCount !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    item.badgeType === 'fault'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {item.badgeCount}
                  {item.key === 'health-performance' ? '%' : ''}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Mini Diagnostics / Telemetry Rate Box */}
      <div className="p-3 border-t border-[#1a2845] bg-[#070b14]/70">
        <div className="p-2.5 rounded bg-[#0d1628] border border-[#1e2e4e] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>TELEM PACKETS</span>
            <span className="text-cyan-300 font-bold">14,892</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>PACKET LOSS</span>
            <span className="text-emerald-400 font-bold">0.00%</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>AI LATENCY</span>
            <span className="text-cyan-400 font-bold">4.2 ms</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

