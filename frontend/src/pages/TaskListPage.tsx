import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { taskApi } from '@/services/api';
import { Task, Priority, TaskStatus } from '@/types';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { ListTodo, Search, Filter, ArrowUpDown, Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';

export const TaskListPage: React.FC = () => {
  const { currentProject } = useAppStore();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['list_tasks', currentProject?.id],
    queryFn: () => taskApi.list(currentProject ? { project_id: currentProject.id } : undefined),
    enabled: !!currentProject,
  });

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-3">
        <ListTodo className="w-12 h-12 text-muted-foreground/40" />
        <h3 className="text-lg font-bold">Select a Project</h3>
        <p className="text-xs text-muted-foreground">Select a project to inspect tasks in spreadsheet / table view.</p>
      </div>
    );
  }

  const filteredTasks = tasks.filter((t: Task) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const priorityColors: Record<string, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    MEDIUM: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    HIGH: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    URGENT: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const statusColors: Record<string, string> = {
    TODO: 'bg-slate-500/10 text-slate-400',
    IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
    REVIEW: 'bg-purple-500/10 text-purple-400',
    DONE: 'bg-emerald-500/10 text-emerald-400',
    BLOCKED: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-primary" /> Table & Spreadsheet View
          </h2>
          <p className="text-xs text-muted-foreground">
            {currentProject.name} — Comprehensive grid inspection (`{filteredTasks.length}` tasks shown)
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground ml-2" />
          <input
            type="text"
            placeholder="Filter tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-secondary px-3 py-1.5 rounded-lg">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold cursor-pointer outline-none text-foreground"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold bg-secondary px-3 py-1.5 rounded-lg">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-bold cursor-pointer outline-none text-foreground"
            >
              <option value="ALL">All Levels</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 font-bold uppercase text-muted-foreground">
                <th className="py-3 px-4 w-20">ID</th>
                <th className="py-3 px-4 min-w-[240px]">Task Title</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-28">Priority</th>
                <th className="py-3 px-4 w-24 text-center">Points</th>
                <th className="py-3 px-4 w-28">Assignee</th>
                <th className="py-3 px-4 w-32">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground italic">
                    No tasks matching filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t: Task) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="hover:bg-secondary/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-muted-foreground group-hover:text-primary">
                      #{t.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground group-hover:text-primary">
                      {t.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${statusColors[t.status] || ''}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded border font-bold ${priorityColors[t.priority] || ''}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {t.story_points || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {t.assignee ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                            {t.assignee.username[0].toUpperCase()}
                          </div>
                          <span>{t.assignee.full_name || t.assignee.username}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {t.due_date ? format(new Date(t.due_date), 'MMM dd, yyyy') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => refetch()}
      />
    </div>
  );
};
