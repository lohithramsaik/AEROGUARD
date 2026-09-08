import React from 'react';
import { PlaneTakeoff, Calendar, Clock, MapPin, Gauge, Download } from 'lucide-react';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';

export const FlightHistoryView: React.FC = () => {
  const sorties = [
    {
      missionId: 'MSN-2026-084',
      date: '2026-09-08',
      type: 'Tactical ISR Border Patrol',
      duration: '03h 42m',
      peakRpm: 2580,
      peakCht: '178.4°C',
      fuelBurned: '78.2 L',
      status: 'AIRBORNE (CURRENT)',
      statusColor: 'text-emerald-400 bg-emerald-950 border-emerald-500/40 animate-pulse',
    },
    {
      missionId: 'MSN-2026-083',
      date: '2026-09-07',
      type: 'High-Altitude Sensor Calib',
      duration: '04h 15m',
      peakRpm: 2620,
      peakCht: '182.1°C',
      fuelBurned: '92.4 L',
      status: 'COMPLETED',
      statusColor: 'text-cyan-300 bg-cyan-950 border-cyan-500/40',
    },
    {
      missionId: 'MSN-2026-082',
      date: '2026-09-05',
      type: 'Endurance Relay Flight',
      duration: '05h 10m',
      peakRpm: 2510,
      peakCht: '174.0°C',
      fuelBurned: '112.6 L',
      status: 'COMPLETED',
      statusColor: 'text-cyan-300 bg-cyan-950 border-cyan-500/40',
    },
    {
      missionId: 'MSN-2026-081',
      date: '2026-09-03',
      type: 'Ground Run-in Test Protocol',
      duration: '01h 05m',
      peakRpm: 2750,
      peakCht: '186.2°C',
      fuelBurned: '24.1 L',
      status: 'INSPECTED',
      statusColor: 'text-slate-300 bg-slate-800 border-slate-700',
    },
  ];

  return (
    <div className="space-y-4">
      <FaultSimulatorPanel />

      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <PlaneTakeoff className="w-4 h-4 text-cyan-400" />
            <span>Flight Sorties & Engine Operational History</span>
          </h2>
          <p className="text-xs text-slate-400">
            Historical flight log with thermal fatigue cycle counts and fuel burn profiles
          </p>
        </div>
      </div>

      <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl overflow-hidden shadow-lg font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0e172a] border-b border-[#1b2b48] text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Mission ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Mission Profile</th>
                <th className="py-2.5 px-3">Flight Time</th>
                <th className="py-2.5 px-3">Peak RPM</th>
                <th className="py-2.5 px-3">Max CHT</th>
                <th className="py-2.5 px-3">Fuel Burn</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15233c] text-slate-300">
              {sorties.map((s) => (
                <tr key={s.missionId} className="hover:bg-[#101b33] transition">
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{s.missionId}</td>
                  <td className="py-2.5 px-3 text-slate-400">{s.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{s.type}</td>
                  <td className="py-2.5 px-3 text-slate-300">{s.duration}</td>
                  <td className="py-2.5 px-3 text-slate-300">{s.peakRpm}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">{s.peakCht}</td>
                  <td className="py-2.5 px-3 text-slate-300">{s.fuelBurned}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${s.statusColor}`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
