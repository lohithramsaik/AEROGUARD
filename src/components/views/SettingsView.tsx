import React, { useState } from 'react';
import { Settings, Sliders, Radio, Cpu, Bell, HardDrive } from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';

export const SettingsView: React.FC = () => {
  const { dataSource, setDataSource } = useEngine();
  const [canBaud, setCanBaud] = useState('1000000');
  const [streamRate, setStreamRate] = useState('50');
  const [brokerUrl, setBrokerUrl] = useState('mqtt://192.168.1.120:1883/uav/engine/telem');
  const [chtWarnThreshold, setChtWarnThreshold] = useState('186');
  const [chtCritThreshold, setChtCritThreshold] = useState('195');

  return (
    <div className="space-y-4">
      <FaultSimulatorPanel />

      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Avionics Telemetry & Hardware Bus Configuration</span>
          </h2>
          <p className="text-xs text-slate-400">
            Interface settings for CAN-Bus, MAVLink, and external ESP32 / Raspberry Pi telemetry streams
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Hardware & Communication Bus */}
        <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#1b2b48] pb-2.5">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 uppercase">Hardware Data Stream Source</h3>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Active Telemetry Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDataSource('SIMULATOR')}
                className={`p-2.5 rounded border text-left font-bold transition ${
                  dataSource === 'SIMULATOR'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-[#0e172a] border-[#1e2f50] text-slate-400'
                }`}
              >
                <div>Internal HIL Simulator</div>
                <div className="text-[10px] text-slate-400 font-normal">Active Simulated Telemetry</div>
              </button>

              <button
                onClick={() => setDataSource('HARDWARE_STREAM')}
                className={`p-2.5 rounded border text-left font-bold transition ${
                  dataSource === 'HARDWARE_STREAM'
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                    : 'bg-[#0e172a] border-[#1e2f50] text-slate-400'
                }`}
              >
                <div>Hardware Stream (MQTT/Serial)</div>
                <div className="text-[10px] text-slate-400 font-normal">ESP32 / Raspberry Pi / CAN</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">MQTT / WebSocket Broker URL</label>
            <input
              type="text"
              value={brokerUrl}
              onChange={(e) => setBrokerUrl(e.target.value)}
              className="w-full bg-[#0e172a] border border-[#1e2f50] rounded px-3 py-1.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">CAN-Bus Baudrate</label>
              <select
                value={canBaud}
                onChange={(e) => setCanBaud(e.target.value)}
                className="w-full bg-[#0e172a] border border-[#1e2f50] rounded px-3 py-1.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="1000000">1 Mbps (Standard Aerospace)</option>
                <option value="500000">500 kbps</option>
                <option value="250000">250 kbps</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Telemetry Rate</label>
              <select
                value={streamRate}
                onChange={(e) => setStreamRate(e.target.value)}
                className="w-full bg-[#0e172a] border border-[#1e2f50] rounded px-3 py-1.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="50">50 Hz (High Fidelity)</option>
                <option value="20">20 Hz</option>
                <option value="10">10 Hz (Bandwidth Saver)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alarm Thresholds */}
        <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#1b2b48] pb-2.5">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-slate-100 uppercase">Alert & Limit Thresholds</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">CHT Caution Limit (°C)</label>
              <input
                type="number"
                value={chtWarnThreshold}
                onChange={(e) => setChtWarnThreshold(e.target.value)}
                className="w-full bg-[#0e172a] border border-[#1e2f50] rounded px-3 py-1.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">CHT Critical Limit (°C)</label>
              <input
                type="number"
                value={chtCritThreshold}
                onChange={(e) => setChtCritThreshold(e.target.value)}
                className="w-full bg-[#0e172a] border border-[#1e2f50] rounded px-3 py-1.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Oil Pressure Low Alarm</label>
            <input
              type="text"
              defaultValue="30 PSI (Critical) / 42 PSI (Caution)"
              disabled
              className="w-full bg-[#0e172a]/60 border border-[#1e2f50] rounded px-3 py-1.5 text-slate-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">AI Residual Sensitivity</label>
            <input
              type="range"
              min="1"
              max="100"
              defaultValue="85"
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>High Precision (Fewer false alarms)</span>
              <span>Ultra Sensitive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
