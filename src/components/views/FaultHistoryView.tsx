import React, { useState, useMemo } from 'react';
import {
  History,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Download,
  Filter,
  Search,
  Calendar,
  Layers,
  ChevronDown,
  X,
  FileText,
  Activity,
  Clock,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';
import { FaultHistoryRecord, FaultSeverity, FaultState } from '../../types/engine';

export const FaultHistoryView: React.FC = () => {
  const { faultHistory, simulationMode } = useEngine();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // 'ALL' | 'ACTIVE' | 'RESOLVED'
  const [parameterFilter, setParameterFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  // Selected row for detail slideout modal
  const [selectedRecord, setSelectedRecord] = useState<FaultHistoryRecord | null>(null);

  // Extract unique available parameters and dates for dynamic filter dropdowns
  const availableParameters = useMemo(() => {
    const params = new Set<string>();
    faultHistory.forEach((rec) => {
      if (rec.parameter) params.add(rec.parameter);
    });
    return Array.from(params).sort();
  }, [faultHistory]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    faultHistory.forEach((rec) => {
      if (rec.date) dates.add(rec.date);
    });
    return Array.from(dates).sort().reverse();
  }, [faultHistory]);

  // Filter and search application
  const filteredRecords = useMemo(() => {
    return faultHistory.filter((rec) => {
      // 1. Text Search
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          rec.id.toLowerCase().includes(query) ||
          rec.flightId.toLowerCase().includes(query) ||
          rec.parameter.toLowerCase().includes(query) ||
          rec.fault.toLowerCase().includes(query) ||
          rec.resolution.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // 2. Severity Filter
      if (severityFilter !== 'ALL' && rec.severity !== severityFilter) {
        return false;
      }

      // 3. Status Filter (Active / Resolved)
      if (statusFilter === 'ACTIVE' && rec.status !== 'ACTIVE') {
        return false;
      }
      if (statusFilter === 'RESOLVED' && rec.status !== 'RESOLVED') {
        return false;
      }

      // 4. Parameter Filter
      if (parameterFilter !== 'ALL' && rec.parameter !== parameterFilter) {
        return false;
      }

      // 5. Date Filter
      if (dateFilter !== 'ALL' && rec.date !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [faultHistory, searchTerm, severityFilter, statusFilter, parameterFilter, dateFilter]);

  // Summary Statistics required at the top:
  // Total Faults, Critical Faults, Warnings, Resolved Faults
  const summary = useMemo(() => {
    let total = faultHistory.length;
    let critical = 0;
    let warnings = 0;
    let resolved = 0;
    let active = 0;

    faultHistory.forEach((rec) => {
      if (rec.severity === 'CRITICAL') critical++;
      if (rec.severity === 'WARNING') warnings++;
      if (rec.status === 'RESOLVED') resolved++;
      if (rec.status === 'ACTIVE') active++;
    });

    return { total, critical, warnings, resolved, active };
  }, [faultHistory]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSeverityFilter('ALL');
    setStatusFilter('ALL');
    setParameterFilter('ALL');
    setDateFilter('ALL');
  };

  const isFiltered =
    searchTerm !== '' ||
    severityFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    parameterFilter !== 'ALL' ||
    dateFilter !== 'ALL';

  // Export to CSV
  const exportCsv = () => {
    if (faultHistory.length === 0) return;

    const headers = [
      'Event ID',
      'Date',
      'Time',
      'Flight ID',
      'Parameter',
      'Fault',
      'Severity',
      'AI Confidence (%)',
      'Duration',
      'Status',
      'Resolution',
      'Trigger Value',
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      r.date,
      r.time,
      r.flightId,
      `"${r.parameter}"`,
      `"${r.fault}"`,
      r.severity,
      r.aiConfidence,
      `"${r.duration}"`,
      r.status,
      `"${r.resolution.replace(/"/g, '""')}"`,
      `"${r.triggerValue || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `aero_engine_fault_history_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportJson = () => {
    const jsonStr = JSON.stringify(filteredRecords, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aero_engine_fault_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* 0. Real-Time Hardware-in-the-Loop Fault Simulator */}
      <FaultSimulatorPanel />

      {/* Header Bar with Title & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span>Telemetry Fault & Excursion History Log</span>
          </h2>
          <p className="text-xs text-slate-400">
            Searchable, auditable event register automatically synchronizing simulated triggers and resolutions
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 rounded-lg bg-[#14233c] hover:bg-[#1b2f52] border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1.5 transition shadow"
            title="Download formatted CSV log"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJson}
            className="px-2.5 py-1.5 rounded-lg bg-[#0b1324] hover:bg-[#15233c] border border-[#1e2f50] text-slate-300 font-medium flex items-center gap-1.5 transition"
            title="Download raw JSON structure"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY STATS CARDS (Total Faults, Critical Faults, Warnings, Resolved Faults) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        {/* 1. Total Faults */}
        <div className="bg-[#0b1324] border border-[#1d2d4d] p-3 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              Total Faults
            </span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-slate-100 mt-1 block">
            {summary.total}
          </span>
          <span className="text-[10px] text-slate-500">Recorded Mission Events</span>
        </div>

        {/* 2. Critical Faults */}
        <div
          className={`p-3 rounded-xl border shadow-lg transition-all ${
            summary.critical > 0
              ? 'bg-[#1b1019] border-rose-500/70 text-rose-300'
              : 'bg-[#0b1324] border-[#1d2d4d] text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Critical Faults
            </span>
            <AlertOctagon
              className={`w-4 h-4 ${
                summary.critical > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'
              }`}
            />
          </div>
          <span className="text-2xl font-black mt-1 block text-rose-400">
            {summary.critical}
          </span>
          <span className="text-[10px] text-slate-500">Airworthiness Exceedances</span>
        </div>

        {/* 3. Warnings */}
        <div
          className={`p-3 rounded-xl border shadow-lg transition-all ${
            summary.warnings > 0
              ? 'bg-[#1c1613] border-amber-500/60 text-amber-300'
              : 'bg-[#0b1324] border-[#1d2d4d] text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Warnings
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black mt-1 block text-amber-300">
            {summary.warnings}
          </span>
          <span className="text-[10px] text-slate-500">Operational Caution Alerts</span>
        </div>

        {/* 4. Resolved Faults */}
        <div className="bg-[#0b1324] border border-[#1d2d4d] p-3 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              Resolved Faults
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {summary.resolved}
          </span>
          <span className="text-[10px] text-slate-500">
            Nominal Normal Restored ({summary.active} Active)
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL TOOLBAR */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] p-3 rounded-xl shadow-md font-mono text-xs space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input Bar */}
          <div className="relative flex-grow max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Event ID, Flight ID, Fault, Parameter, or Resolution..."
              className="w-full pl-9 pr-8 py-1.5 bg-[#070d19] border border-[#1e2f50] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear Button */}
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 rounded bg-rose-950/40 border border-rose-700/60"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Selection Controls (Severity, Active, Resolved, Parameter, Date) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#16233a] text-xs">
          <div className="flex items-center space-x-1 text-slate-400 mr-1 text-[11px]">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>FILTERS:</span>
          </div>

          {/* 1. Status Filter Pills (All / Active / Resolved) */}
          <div className="flex items-center bg-[#070d19] border border-[#1e2f50] rounded-lg p-0.5 text-[11px]">
            {[
              { key: 'ALL', label: 'All Status' },
              { key: 'ACTIVE', label: `Active (${summary.active})` },
              { key: 'RESOLVED', label: `Resolved (${summary.resolved})` },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                className={`px-2.5 py-1 rounded-md transition ${
                  statusFilter === st.key
                    ? st.key === 'ACTIVE'
                      ? 'bg-rose-950 text-rose-300 border border-rose-600 font-bold'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* 2. Severity Filter Selector */}
          <div className="flex items-center space-x-1 bg-[#070d19] border border-[#1e2f50] rounded-lg px-2 py-1 text-[11px]">
            <span className="text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0b1324] text-slate-200">
                All Severities
              </option>
              <option value="CRITICAL" className="bg-[#0b1324] text-rose-400">
                CRITICAL
              </option>
              <option value="WARNING" className="bg-[#0b1324] text-amber-400">
                WARNING
              </option>
              <option value="NORMAL" className="bg-[#0b1324] text-emerald-400">
                NORMAL
              </option>
            </select>
          </div>

          {/* 3. Parameter Filter Selector */}
          <div className="flex items-center space-x-1 bg-[#070d19] border border-[#1e2f50] rounded-lg px-2 py-1 text-[11px]">
            <span className="text-slate-500">Parameter:</span>
            <select
              value={parameterFilter}
              onChange={(e) => setParameterFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0b1324] text-slate-200">
                All Parameters
              </option>
              {availableParameters.map((p) => (
                <option key={p} value={p} className="bg-[#0b1324] text-slate-200">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Filter Selector */}
          <div className="flex items-center space-x-1 bg-[#070d19] border border-[#1e2f50] rounded-lg px-2 py-1 text-[11px]">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span className="text-slate-500">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0b1324] text-slate-200">
                All Dates
              </option>
              {availableDates.map((d) => (
                <option key={d} value={d} className="bg-[#0b1324] text-slate-200">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FAULT HISTORY TABLE */}
      <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0d1628] border-b border-[#1b2b48] text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Flight ID</th>
                <th className="py-3 px-3">Parameter</th>
                <th className="py-3 px-3">Fault</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">AI Confidence</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15233c] text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#0e172a] border border-[#233554] flex items-center justify-center text-slate-400 shadow-inner">
                        {isFiltered ? <Filter className="w-6 h-6 text-amber-400" /> : <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                      </div>
                      <div className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                        {isFiltered ? 'NO FAULTS MATCH SELECTED FILTER CRITERIA' : 'FLIGHT RECORDER LOG IS EMPTY'}
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-md">
                        {isFiltered
                          ? 'No flight telemetry faults meet the combined search string and column filters. Adjust filters or reset to view all historical records.'
                          : 'No abnormal thermodynamic, mechanical, or electrical events have been logged for this aircraft airframe.'}
                      </p>
                      {isFiltered && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-1 px-3 py-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset All Active Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((log) => {
                  const isCrit = log.severity === 'CRITICAL';
                  const isWarn = log.severity === 'WARNING';
                  const isActive = log.status === 'ACTIVE';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedRecord(log)}
                      className={`hover:bg-[#121f38] cursor-pointer transition ${
                        isActive ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      {/* 1. Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                        {log.date}
                      </td>

                      {/* 2. Time */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                        {log.time}
                      </td>

                      {/* 3. Flight ID */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-bold text-cyan-400">
                        {log.flightId}
                      </td>

                      {/* 4. Parameter */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#15233e] text-slate-200 border border-[#21355a] font-semibold text-[11px]">
                          {log.parameter}
                        </span>
                      </td>

                      {/* 5. Fault */}
                      <td className="py-2.5 px-3 font-semibold text-slate-100 max-w-xs truncate">
                        {log.fault}
                      </td>

                      {/* 6. Severity */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${
                            isCrit
                              ? 'bg-rose-600 text-white shadow-sm'
                              : isWarn
                              ? 'bg-amber-600 text-black'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>

                      {/* 7. AI Confidence */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-bold text-purple-300">
                        {log.aiConfidence}%
                      </td>

                      {/* 8. Duration */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-300">
                        <span
                          className={`flex items-center gap-1 ${
                            isActive ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{log.duration}</span>
                        </span>
                      </td>

                      {/* 9. Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/80 animate-pulse'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {isActive ? (
                            <AlertOctagon className="w-3 h-3 text-rose-400" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>{log.status}</span>
                        </span>
                      </td>

                      {/* 10. Resolution */}
                      <td className="py-2.5 px-3 text-slate-400 max-w-sm truncate text-[11px]">
                        {log.resolution}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & row counter */}
        <div className="p-3 bg-[#0a101d] border-t border-[#182643] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>
            Showing <strong className="text-cyan-300">{filteredRecords.length}</strong> of{' '}
            <strong className="text-slate-200">{faultHistory.length}</strong> total recorded events
          </span>
          <span className="text-slate-500">
            Click any row to view complete flight snapshot & engineering resolution notes
          </span>
        </div>
      </div>

      {/* DETAIL INSPECTION MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1324] border border-[#21355a] rounded-2xl w-full max-w-xl p-5 font-mono shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#182643] pb-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedRecord.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                />
                <h3 className="text-base font-bold text-slate-100 uppercase">
                  Fault Event Snapshot — {selectedRecord.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-[#142038]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#070d19] p-2.5 rounded-lg border border-[#16233a]">
                <span className="text-slate-500 block text-[9px] uppercase">
                  Date & Time
                </span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  {selectedRecord.date} • {selectedRecord.time}
                </span>
              </div>

              <div className="bg-[#070d19] p-2.5 rounded-lg border border-[#16233a]">
                <span className="text-slate-500 block text-[9px] uppercase">
                  Sortie Flight ID
                </span>
                <span className="font-bold text-cyan-300 mt-0.5 block">
                  {selectedRecord.flightId}
                </span>
              </div>

              <div className="bg-[#070d19] p-2.5 rounded-lg border border-[#16233a]">
                <span className="text-slate-500 block text-[9px] uppercase">
                  Affected Parameter
                </span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  {selectedRecord.parameter}
                </span>
              </div>

              <div className="bg-[#070d19] p-2.5 rounded-lg border border-[#16233a]">
                <span className="text-slate-500 block text-[9px] uppercase">
                  AI Confidence
                </span>
                <span className="font-bold text-purple-300 mt-0.5 block">
                  {selectedRecord.aiConfidence}% Bayesian Likelihood
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold">
                Fault Classification:
              </span>
              <div className="p-2.5 rounded-lg bg-[#070d19] border border-[#16233a] font-semibold text-slate-100">
                {selectedRecord.fault}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold">
                Resolution & Remediation Directive:
              </span>
              <div
                className={`p-3 rounded-lg border ${
                  selectedRecord.status === 'ACTIVE'
                    ? 'bg-rose-950/30 border-rose-600/40 text-rose-300'
                    : 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px]">
                  <span className="font-bold uppercase">Status: {selectedRecord.status}</span>
                  <span>Duration: {selectedRecord.duration}</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-200">
                  {selectedRecord.resolution}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#182643]">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-[#14233c] hover:bg-[#1b2f52] text-slate-200 border border-[#23385e] font-bold text-xs"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
