import React from 'react';
import { CheckCircle2, Server, Cpu, HardDrive, Wifi, Radio } from 'lucide-react';
import { useEngine } from '../../context/EngineContext';

export const SystemStatusPanel: React.FC = () => {
  const { subsystems, status, dataSource } = useEngine();

  const systems = [
    { name: 'Sensor System', status: subsystems.sensorSystem, icon: Radio, latency: '2 ms' },
    { name: 'Data Stream', status: subsystems.dataStream, icon: Wifi, latency: '12 ms' },
    { name: 'AI Model', status: subsystems.aiModel, icon: Cpu, latency: '4 ms' },
    { name: 'Digital Twin', status: subsystems.digitalTwin, icon: Server, latency: '60 FPS' },
    { name: 'Database', status: subsystems.database, icon: HardDrive, latency: '1 ms' },
  ];

  return (
    <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 flex flex-col justify-between shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b2b48] pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
            System Subsystems Status
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
          ALL NODES ACTIVE
        </span>
      </div>

      {/* 5 Subsystem Rows */}
      <div className="space-y-2 font-mono text-xs">
        {systems.map((sys) => (
          <div
            key={sys.name}
            className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48] flex items-center justify-between hover:border-[#253960] transition"
          >
            <div className="flex items-center space-x-2.5">
              <sys.icon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-200 font-medium">{sys.name}</span>
            </div>

            <div className="flex items-center space-x-2.5">
              <span className="text-[10px] text-slate-500">{sys.latency}</span>
              <div className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{sys.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-[#1b2b48] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="text-slate-500">BUS: CAN 2.0B / SPI / I2C</span>
        <span className="text-cyan-400">SYNC: CONTINUOUS</span>
      </div>
    </div>
  );
};
