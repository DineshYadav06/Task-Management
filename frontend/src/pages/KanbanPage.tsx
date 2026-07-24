import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { FolderKanban, Sparkles, Plus, ListTodo, Calendar as CalendarIcon } from 'lucide-react';
import { projectApi } from '@/services/api';

export const KanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentProject } = useAppStore();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [healthScore, setHealthScore] = useState<{ score: number; status: string } | null>(null);

  useEffect(() => {
    const taskIdParam = searchParams.get('task'); 
    if (taskIdParam) {
      setSelectedTaskId(Number(taskIdParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentProject) {
      projectApi.getHealth(currentProject.id)
        .then((res) => setHealthScore(res.health_score ? { score: res.health_score, status: res.status } : res))
        .catch(() => setHealthScore(null));
    }
  }, [currentProject]);

  const handleSelectTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setSearchParams({ task: String(taskId) });
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
    searchParams.delete('task');
    setSearchParams(searchParams);
  };

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center mb-1 shadow-sm">
          <FolderKanban className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-heading">No Project Selected</h3>
        <p className="text-muted text-xs max-w-md leading-relaxed">
          Select an active engineering project from the left sidebar or initialize a new repository to launch the drag-and-drop Kanban board.
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Go to Projects Directory
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 animate-fadeIn pb-6">
      {/* Project Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded">
              {currentProject.key}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-heading">{currentProject.name}</h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {currentProject.description || 'Continuous Kanban Sprint Board with WebSocket Synchronization'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick View Switchers */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shadow-2xs text-xs font-semibold">
            <button
              onClick={() => navigate('/kanban')}
              className="px-3 py-1 rounded-md bg-primary/15 text-primary font-bold flex items-center gap-1.5"
            >
              <FolderKanban className="w-3.5 h-3.5" /> Board
            </button>
            <button
              onClick={() => navigate('/list')}
              className="px-3 py-1 rounded-md text-muted hover:text-heading flex items-center gap-1.5 transition-colors"
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

          {/* AI Health Score Badge */}
          {healthScore && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-heading">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Health:</span>
              </div>
              <span
                className={`font-black text-xs px-2 py-0.5 rounded ${
                  healthScore.score >= 80
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
                    : healthScore.score >= 50
                    ? 'bg-amber-500/15 text-amber-600 border border-amber-500/20'
                    : 'bg-red-500/15 text-red-600 border border-red-500/20'
                }`}
              >
                {healthScore.score}% ({healthScore.status || 'Stable'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-hidden min-h-[500px]">
        <KanbanBoard
          projectId={currentProject.id}
          onSelectTask={handleSelectTask}
        />
      </div>

      {/* Task Inspection Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={handleCloseModal}
        onTaskUpdated={() => {}}
      />
    </div>
  );
};
