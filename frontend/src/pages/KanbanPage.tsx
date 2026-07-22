import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { FolderKanban, Sparkles, AlertCircle } from 'lucide-react';
import { projectApi } from '@/services/api';

export const KanbanPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentProject } = useAppStore();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [healthScore, setHealthScore] = useState<{ score: number; status: string; bottlenecks_count?: number } | null>(null);

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
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
          <FolderKanban className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">No Project Selected</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Please select a project from the left sidebar or create your first project inside this workspace to view the Kanban board.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 animate-fadeIn">
      {/* Project Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
              {currentProject.key}
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">{currentProject.name}</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentProject.description || 'Active Sprint Kanban Board with Real-time WebSocket Sync'}
          </p>
        </div>

        {/* AI Health Score Badge */}
        {healthScore && (
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-secondary/40 border border-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Project Health:</span>
            </div>
            <span
              className={`font-black text-sm px-2 py-0.5 rounded ${
                healthScore.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : healthScore.score >= 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {healthScore.score}% ({healthScore.status || 'Healthy'})
            </span>
          </div>
        )}
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-hidden">
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
