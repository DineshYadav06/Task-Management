import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timeApi } from '@/services/api';
import { TimeLog } from '@/types';
import { Clock, Play, Square, Plus, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const TimeTrackingPage: React.FC = () => {
  const [manualModal, setManualModal] = useState(false);
  const [taskIdInput, setTaskIdInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [hoursInput, setHoursInput] = useState('');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['user_time_logs'],
    queryFn: () => timeApi.getLogs(),
  });

  const { data: timesheet = { data: { total_hours: 0, entries_count: 0 } } } = useQuery<any>({
    queryKey: ['weekly_timesheet'],
    queryFn: () => timeApi.getTimesheet(new Date().toISOString().slice(0, 10)),
  });

  const activeRunningLog = logs.find((l: TimeLog) => l.is_running);

  const handleStopRunning = async () => {
    if (!activeRunningLog) return;
    try {
      await timeApi.stopTimer(activeRunningLog.id);
      refetch();
    } catch {
      alert('Failed to stop timer');
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskIdInput || !hoursInput) return;
    try {
      await timeApi.startTimer(Number(taskIdInput), descInput || `Manual log ${hoursInput} hours`);
      setManualModal(false);
      setTaskIdInput('');
      setHoursInput('');
      setDescInput('');
      refetch();
    } catch {
      alert('Failed to log time');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5 text-heading">
            <Clock className="w-6 h-6 text-primary" /> Time Tracking & Timesheets
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Monitor active work hours, review timesheet billing logs, and track engineering utilization.
          </p>
        </div>

        <button
          onClick={() => setManualModal(true)}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Log Manual Hours
        </button>
      </div>

      {/* Active Running Banner */}
      {activeRunningLog && (
        <div className="p-5 rounded-xl bg-primary/15 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold shadow-2xs">
              <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Active Stopwatch Running</span>
              <h4 className="font-bold text-base text-heading">Task #{activeRunningLog.task_id}: {activeRunningLog.description || 'Active engineering task'}</h4>
              <p className="text-xs text-muted mt-0.5">Started at {format(new Date(activeRunningLog.start_time), 'hh:mm a')}</p>
            </div>
          </div>

          <button
            onClick={handleStopRunning}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" /> Stop Running Timer
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-surface border border-border shadow-2xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" /> This Week Logged
          </span>
          <p className="text-3xl font-extrabold text-heading">{timesheet.data?.total_hours || 0} hrs</p>
          <p className="text-[11px] text-emerald-600 font-bold">Across {timesheet.data?.entries_count || 0} time entries</p>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border shadow-2xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-600" /> Total Billable Utilization
          </span>
          <p className="text-3xl font-extrabold text-purple-700">{timesheet.data?.total_hours || 0} hrs</p>
          <p className="text-[11px] text-muted">100% target billable engineering rate</p>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border shadow-2xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Play className="w-4 h-4 text-emerald-600" /> Active Timers
          </span>
          <p className="text-3xl font-extrabold text-emerald-600">{activeRunningLog ? '1 Running' : '0 Running'}</p>
          <p className="text-[11px] text-muted">Automatic precision calculations</p>
        </div>
      </div>

      {/* Logs History Table */}
      <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border font-bold text-sm text-heading flex items-center justify-between bg-secondary/30">
          <span>Recent Time Log Entries</span>
          <span className="text-xs text-muted font-normal font-mono">{logs.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 font-bold uppercase text-muted tracking-wider">
                <th className="py-3 px-4 w-24">Log ID</th>
                <th className="py-3 px-4 w-28">Task Key</th>
                <th className="py-3 px-4 min-w-[240px]">Description</th>
                <th className="py-3 px-4 w-40">Start Time</th>
                <th className="py-3 px-4 w-40">End Time</th>
                <th className="py-3 px-4 w-28 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted italic">
                    No time tracking logs recorded yet. Start a timer from any task inspection card!
                  </td>
                </tr>
              ) : (
                logs.map((log: TimeLog) => (
                  <tr key={log.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-muted">#{log.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">TASK-{log.task_id}</td>
                    <td className="py-3 px-4 font-medium text-heading truncate max-w-md">{log.description || 'Sprint task implementation'}</td>
                    <td className="py-3 px-4 font-mono text-muted">{format(new Date(log.start_time), 'MMM dd, yyyy hh:mm a')}</td>
                    <td className="py-3 px-4 font-mono text-muted">
                      {log.end_time ? format(new Date(log.end_time), 'hh:mm a') : <span className="text-emerald-600 font-bold animate-pulse">RUNNING</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-heading">
                      {log.duration_hours}h
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Time Log Modal */}
      {manualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-lg p-6 space-y-4">
            <h3 className="font-bold text-base text-heading">Log Manual Hours</h3>
            <form onSubmit={handleAddManual} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Task ID (#)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 101"
                  value={taskIdInput}
                  onChange={(e) => setTaskIdInput(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  placeholder="e.g. 3.5"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Description / Work Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Code review and unit test coverage"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setManualModal(false)} className="px-3 py-1.5 rounded-lg text-xs hover:bg-secondary text-muted">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary-hover">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
