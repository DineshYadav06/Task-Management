import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { taskApi } from '@/services/api';
import { Task } from '@/types';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import {
  ListTodo, Search, Filter, Loader2, Plus, FolderKanban, Calendar as CalendarIcon,
  Download, CheckSquare, ArrowUpDown, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

export const TaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject } = useAppStore();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<'id' | 'title' | 'priority' | 'story_points' | 'due_date'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['list_tasks', currentProject?.id],
    queryFn: () => taskApi.list(currentProject ? { project_id: currentProject.id } : undefined),
    enabled: !!currentProject,
  });

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center mb-1 shadow-sm">
          <ListTodo className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-heading">No Project Selected</h3>
        <p className="text-muted text-xs max-w-md leading-relaxed">
          Select an active engineering project from the left sidebar to inspect tasks in spreadsheet table grid view.
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Select from Projects Directory
        </button>
      </div>
    );
  }

  const filteredTasks = tasks.filter((t: Task) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a: Task, b: Task) => {
    if (sortField === 'id') return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
    if (sortField === 'story_points') return sortOrder === 'asc' ? (a.story_points || 0) - (b.story_points || 0) : (b.story_points || 0) - (a.story_points || 0);
    if (sortField === 'title') return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    return 0;
  });

  const priorityColors: Record<string, string> = {
    LOW: 'bg-secondary/80 text-foreground border-border',
    MEDIUM: 'bg-primary/15 text-primary border-primary/20',
    HIGH: 'bg-amber-500/15 text-amber-600 border-amber-500/20 font-bold',
    URGENT: 'bg-red-500/15 text-red-600 border-red-500/20 font-bold',
  };

  const statusColors: Record<string, string> = {
    TODO: 'bg-secondary/80 text-foreground border-border',
    IN_PROGRESS: 'bg-primary/15 text-primary border-primary/20 font-bold',
    REVIEW: 'bg-purple-500/15 text-purple-600 border-purple-500/20 font-bold',
    DONE: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20 font-bold',
    BLOCKED: 'bg-red-500/15 text-red-600 border-red-500/20 font-bold',
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(filteredTasks.map((t: Task) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectOne = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  const handleExportCsv = () => {
    if (!filteredTasks.length) return;
    const headers = ['ID', 'Key', 'Title', 'Status', 'Priority', 'Story Points', 'Due Date', 'Assignee'];
    const rows = filteredTasks.map((t: Task) => [
      t.id,
      `TASK-${t.id}`,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.story_points || 0,
      t.due_date ? format(new Date(t.due_date), 'yyyy-MM-dd') : '',
      t.assignee?.full_name || t.assignee?.username || 'Unassigned'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentProject.key}_Tasks_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header with View Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded">
              {currentProject.key}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-heading">Spreadsheet Table Grid</h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {currentProject.name} — Structured multi-column backlog inspection (`{filteredTasks.length}` tasks)
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* View Switcher */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shadow-2xs text-xs font-semibold">
            <button
              onClick={() => navigate('/kanban')}
              className="px-3 py-1 rounded-md text-muted hover:text-heading flex items-center gap-1.5 transition-colors"
            >
              <FolderKanban className="w-3.5 h-3.5" /> Board
            </button>
            <button
              onClick={() => navigate('/list')}
              className="px-3 py-1 rounded-md bg-primary/15 text-primary font-bold flex items-center gap-1.5"
            >
              <ListTodo className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="px-3 py-1 rounded-md text-muted hover:text-heading flex items-center gap-1.5 transition-colors"
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Timeline
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={filteredTasks.length === 0}
            className="px-3.5 py-1.5 rounded-lg bg-surface border border-border text-heading hover:bg-secondary text-xs font-semibold flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-primary" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Bulk Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-border shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted ml-1" />
          <input
            type="text"
            placeholder="Search tasks across backlog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-medium text-heading placeholder:text-muted"
          />
        </div>

        <div className="flex items-center gap-3">
          {selectedTaskIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/15 border border-primary/20 rounded-lg text-primary text-xs font-bold animate-fadeIn">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{selectedTaskIds.length} Selected</span>
              <button
                onClick={() => setSelectedTaskIds([])}
                className="ml-1 text-[10px] text-muted hover:text-heading underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs font-semibold bg-secondary px-3 py-1.5 rounded-lg border border-border">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold cursor-pointer outline-none text-heading"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold bg-secondary px-3 py-1.5 rounded-lg border border-border">
            <span className="text-muted">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-bold cursor-pointer outline-none text-heading"
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

      {/* Enterprise Table Surface */}
      <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/60 font-bold uppercase text-muted tracking-wider select-none">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-0 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => { setSortField('id'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                  className="py-3 px-3 w-24 cursor-pointer hover:text-heading transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Task Key</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => { setSortField('title'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                  className="py-3 px-4 min-w-[280px] cursor-pointer hover:text-heading transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Title & Specification</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-28">Priority</th>
                <th
                  onClick={() => { setSortField('story_points'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                  className="py-3 px-4 w-24 text-center cursor-pointer hover:text-heading transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Points</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 w-36">Assignee</th>
                <th className="py-3 px-4 w-32">Due Date</th>
                <th className="py-3 px-4 w-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted italic">
                    No tasks match the active table filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t: Task) => {
                  const isSelected = selectedTaskIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={`hover:bg-secondary/40 cursor-pointer transition-colors group ${
                        isSelected ? 'bg-primary/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => handleSelectOne(t.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-muted group-hover:text-primary transition-colors">
                        TASK-{t.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-heading group-hover:text-primary transition-colors truncate max-w-md">
                        {t.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${statusColors[t.status] || ''}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${priorityColors[t.priority] || ''}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-heading">
                        {t.story_points || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {t.assignee ? (
                          <div className="flex items-center gap-2 font-medium text-heading">
                            <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shadow-2xs">
                              {t.assignee.username[0].toUpperCase()}
                            </div>
                            <span className="truncate max-w-[100px]">{t.assignee.full_name || t.assignee.username}</span>
                          </div>
                        ) : (
                          <span className="text-muted/60 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted">
                        {t.due_date ? format(new Date(t.due_date), 'MMM dd, yyyy') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all inline-block" />
                      </td>
                    </tr>
                  );
                })
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
