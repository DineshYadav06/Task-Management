import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { taskApi } from '@/services/api';
import { Task } from '@/types';
import { BarChart3, TrendingDown, CheckCircle2, AlertTriangle, Sparkles, FolderSearch, Loader2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { currentProject } = useAppStore();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['analytics_tasks', currentProject?.id],
    queryFn: () => taskApi.list(currentProject ? { project_id: currentProject.id } : undefined),
    enabled: !!currentProject,
  });

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-16 space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-1 shadow-sm">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-heading">No Project Selected</h3>
        <p className="text-muted text-xs max-w-md leading-relaxed">
          Select an active engineering repository from the workspace sidebar to inspect burndown curves, velocity metrics, and bottleneck reports.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate dynamic metrics from live task records
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: Task) => t.status === 'DONE').length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0.0';

  const totalPoints = tasks.reduce((sum: number, t: Task) => sum + (t.story_points || 0), 0);
  const completedPoints = tasks
    .filter((t: Task) => t.status === 'DONE')
    .reduce((sum: number, t: Task) => sum + (t.story_points || 0), 0);
  const remainingPoints = totalPoints - completedPoints;

  const blockedTasksCount = tasks.filter((t: Task) => t.status === 'BLOCKED').length;

  // Compute burndown curve from task list
  const burndownData = totalTasks > 0 ? [
    { day: 'Sprint Start', ideal: totalPoints, actual: totalPoints },
    { day: 'Midpoint Check', ideal: Math.round(totalPoints * 0.5), actual: remainingPoints },
    { day: 'Target End', ideal: 0, actual: 0 }
  ] : [];

  // Compute velocity from task list
  const velocityData = totalTasks > 0 ? [
    { sprint: 'Current Cycle', completedPoints, committedPoints: totalPoints }
  ] : [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded">
              {currentProject.key}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-heading">Analytics & Burndown Reports</h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {currentProject.name} — Real-time sprint velocity and burn charts (`{totalTasks}` tasks tracked)
          </p>
        </div>
      </div>

      {totalTasks === 0 ? (
        <div className="p-16 rounded-2xl bg-surface border border-border text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-secondary/60 text-muted flex items-center justify-center mx-auto">
            <FolderSearch className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-heading">No Task Data Available Yet</h3>
          <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
            Burndown curves and velocity graphs require active sprint tasks. Create your first user stories inside the Kanban board or Table view to automatically compute burndown trends.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-surface border border-border shadow-2xs space-y-1.5">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sprint Completion Rate
              </span>
              <p className="text-3xl font-extrabold text-heading">{completionRate}%</p>
              <p className="text-[11px] text-emerald-600 font-bold">{completedTasks} of {totalTasks} tasks completed</p>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-border shadow-2xs space-y-1.5">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-primary" /> Remaining Points
              </span>
              <p className="text-3xl font-extrabold text-primary">{remainingPoints} pts</p>
              <p className="text-[11px] text-muted">Out of {totalPoints} total committed story points</p>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-border shadow-2xs space-y-1.5">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Bottleneck Alert
              </span>
              <p className="text-3xl font-extrabold text-amber-600">{blockedTasksCount}</p>
              <p className="text-[11px] text-muted font-medium">{blockedTasksCount === 0 ? 'All tasks flowing smoothly' : 'Tasks flagged as blocked'}</p>
            </div>

            <div className="p-5 rounded-xl bg-purple-500/15 border border-purple-500/20 shadow-2xs space-y-1.5">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> AI Productivity Score
              </span>
              <p className="text-3xl font-extrabold text-purple-300">{completionRate >= '70.0' ? 'Optimal' : completionRate >= '40.0' ? 'On Track' : 'Needs Focus'}</p>
              <p className="text-[11px] text-purple-400 font-semibold">Live computation from active velocity</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sprint Burndown Chart */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-heading flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-primary" /> Active Sprint Burndown Curve
                </h3>
                <p className="text-xs text-muted">Comparison of Ideal burn vs Actual remaining story points</p>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burndownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontWeight={600} />
                    <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal Remaining" strokeWidth={2} />
                    <Line type="monotone" dataKey="actual" stroke="#2563EB" name="Actual Remaining" strokeWidth={3} dot={{ r: 5, fill: '#2563EB' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Team Velocity Chart */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-heading flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" /> Team Sprint Velocity History
                </h3>
                <p className="text-xs text-muted">Committed vs Completed story points in current sprint cycle</p>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="sprint" stroke="#64748b" fontSize={11} fontWeight={600} />
                    <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="committedPoints" fill="#94a3b8" name="Committed Points" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completedPoints" fill="#10B981" name="Completed Points" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
