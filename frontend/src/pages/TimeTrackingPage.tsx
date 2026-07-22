import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timeApi, taskApi } from '@/services/api';
import { TimeLog } from '@/types';
import { Clock, Play, Square, Plus, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const TimeTrackingPage: React.FC = () => {
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  const [manualModal, setManualModal] = useState(false);
  const [taskIdInput, setTaskIdInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [hoursInput, setHoursInput] = useState('');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['user_time_logs'],
    queryFn: () => timeApi.getLogs(),
  });

  const { data: timesheet = { data: { total_hours: 0, entries_count: 0 } } } = useQuery({
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
      const now = new Date();
      const start = new Date(now.getTime() - Number(hoursInput) * 3600 * 1000);
      await timeApi.startTimer(Number(taskIdInput), descInput);
      setManualModal(false);
      setTaskIdInput('');
      setHoursInput('');
      refetch();
    } catch {
      alert('Failed to log time');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> Enterprise Time Tracking & Timesheets
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitor active work hours, review timesheet billing logs, and track team utilization.
          </p>
        </div>

        <button
          onClick={() => setManualModal(true)}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Log Manual Hours
        </button>
      </div>

      {/* Active Running Banner */}
      {activeRunningLog && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/60 via-emerald-950/40 to-slate-900 border border-emerald-500/40 flex items-center justify-between shadow-lg animate-pulse-glow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active Stopwatch Running</span>
              <h4 className="font-extrabold text-base text-white">Task #{activeRunningLog.task_id}: {activeRunningLog.description || 'Active task'}</h4>
              <p className="text-xs text-slate-300">Started {format(new Date(activeRunningLog.start_time), 'hh:mm a')}</p>
            </div>
          </div>

          <button
            onClick={handleStopRunning}
            className="px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Square className="w-4 h-4 fill-current" /> Stop Running Timer
          </button>
        </div>
      )}

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" /> This Week Logged
          </span>
          <p className="text-3xl font-extrabold text-foreground">{timesheet.data?.total_hours || 0} hrs</p>
          <p className="text-[10px] text-emerald-500 font-semibold">Across {timesheet.data?.entries_count || 0} time entries</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-500" /> Total Billable
          </span>
          <p className="text-3xl font-extrabold text-purple-400">{timesheet.data?.total_hours || 0} hrs</p>
          <p className="text-[10px] text-muted-foreground">100% billable utilization rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <Play className="w-4 h-4 text-emerald-500" /> Active Timers
          </span>
          <p className="text-3xl font-extrabold text-emerald-500">{activeRunningLog ? '1 Running' : '0 Running'}</p>
          <p className="text-[10px] text-muted-foreground">Automatic background calculations</p>
        </div>
      </div>

      {/* Logs History Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border font-bold text-sm">Recent Time Log Entries</div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40 font-bold uppercase text-muted-foreground">
              <th className="py-3 px-4">Log ID</th>
              <th className="py-3 px-4">Task ID</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Start Time</th>
              <th className="py-3 px-4">End Time</th>
              <th className="py-3 px-4 text-right">Duration (Hrs)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
                  No time tracking logs recorded yet. Start a timer from any task card!
                </td>
              </tr>
            ) : (
              logs.map((log: TimeLog) => (
                <tr key={log.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-muted-foreground">#{log.id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-primary">TASK-{log.task_id}</td>
                  <td className="py-3 px-4 font-medium">{log.description || 'General task work'}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">{format(new Date(log.start_time), 'MMM dd, yyyy hh:mm a')}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">
                    {log.end_time ? format(new Date(log.end_time), 'hh:mm a') : <span className="text-emerald-500 font-bold animate-pulse">RUNNING</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-base text-foreground">
                    {log.duration_hours}h
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
