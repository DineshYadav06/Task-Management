import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Loader2, RefreshCw } from 'lucide-react';
import { BoardColumn, Task } from '@/types';
import { kanbanApi, taskApi } from '@/services/api';
import { socketService } from '@/services/socket';
import { KanbanColumn } from './KanbanColumn';

interface Props {
  projectId: number;
  onSelectTask: (taskId: number) => void;
}

export const KanbanBoard: React.FC<Props> = ({ projectId, onSelectTask }) => {
  const queryClient = useQueryClient();
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [newColumnModal, setNewColumnModal] = useState(false);
  const [colName, setColName] = useState('');
  const [colWip, setColWip] = useState<number>(0);

  // Quick Add Task Modal
  const [quickAddModal, setQuickAddModal] = useState<{ open: boolean; columnId: number | null }>({ open: false, columnId: null });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

  // Fetch Columns
  const { data: columns = [], isLoading: colsLoading } = useQuery({
    queryKey: ['kanban_columns', projectId],
    queryFn: () => kanbanApi.getColumns(projectId),
    enabled: !!projectId,
  });

  // Fetch Tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['project_tasks', projectId],
    queryFn: () => taskApi.list({ project_id: projectId }),
    enabled: !!projectId,
  });

  // WebSocket sync for real-time task movement
  useEffect(() => {
    const handleTaskMoved = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ['project_tasks', projectId] });
    };
    socketService.on('kanban:task_moved', handleTaskMoved);
    return () => {
      socketService.off('kanban:task_moved', handleTaskMoved);
    };
  }, [projectId, queryClient]);

  // Move Task Mutation
  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, targetColumnId }: { taskId: number; targetColumnId: number }) => {
      return kanbanApi.moveTask(taskId, targetColumnId);
    },
    onMutate: async ({ taskId, targetColumnId }) => {
      await queryClient.cancelQueries({ queryKey: ['project_tasks', projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>(['project_tasks', projectId]);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(['project_tasks', projectId], (old = []) =>
          old.map((t) => (t.id === taskId ? { ...t, column_id: targetColumnId } : t))
        );
      }
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['project_tasks', projectId], context.previousTasks);
      }
      alert('Failed to move task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project_tasks', projectId] });
    },
  });

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;
    try {
      await kanbanApi.createColumn({
        project_id: projectId,
        name: colName,
        position: columns.length + 1,
        wip_limit: colWip,
      });
      setColName('');
      setColWip(0);
      setNewColumnModal(false);
      queryClient.invalidateQueries({ queryKey: ['kanban_columns', projectId] });
    } catch {
      alert('Failed to create column');
    }
  };

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !quickAddModal.columnId) return;
    try {
      await taskApi.create({
        project_id: projectId,
        column_id: quickAddModal.columnId,
        title: newTaskTitle,
        priority: newTaskPriority as any,
        status: 'TODO',
        story_points: 2,
      });
      setNewTaskTitle('');
      setQuickAddModal({ open: false, columnId: null });
      queryClient.invalidateQueries({ queryKey: ['project_tasks', projectId] });
    } catch {
      alert('Failed to add task');
    }
  };

  const filteredTasks = tasks.filter((t: Task) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  if (colsLoading || tasksLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full space-y-4">
        {/* Kanban Top Toolbar */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold bg-secondary px-3 py-1.5 rounded-lg border border-border">
              <Filter className="w-3.5 h-3.5 text-primary" />
              <span>Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent font-bold cursor-pointer outline-none text-foreground"
              >
                <option value="ALL">All Levels</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['project_tasks', projectId] })}
              className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
              title="Refresh Board"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setNewColumnModal(true)}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Column
          </button>
        </div>

        {/* Board Columns Horizontal Scroll */}
        <div className="flex-1 flex items-start gap-4 overflow-x-auto pb-4 pt-1">
          {columns.length === 0 ? (
            <div className="w-full h-64 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <p className="text-sm font-semibold">No board columns setup for this project.</p>
              <button
                onClick={() => setNewColumnModal(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
              >
                Create First Column (e.g. To Do, In Progress, Done)
              </button>
            </div>
          ) : (
            columns.map((col: BoardColumn) => {
              const colTasks = filteredTasks.filter((t: Task) => t.column_id === col.id);
              return (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={colTasks}
                  onTaskDrop={(taskId, targetColumnId) => moveTaskMutation.mutate({ taskId, targetColumnId })}
                  onSelectTask={onSelectTask}
                  onQuickAdd={(columnId) => setQuickAddModal({ open: true, columnId })}
                />
              );
            })
          )}
        </div>

        {/* New Column Modal */}
        {newColumnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
              <h3 className="font-bold text-base">Add New Board Column</h3>
              <form onSubmit={handleCreateColumn} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Column Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QA Verification"
                    value={colName}
                    onChange={(e) => setColName(e.target.value)}
                    className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">WIP Limit (0 for unlimited)</label>
                  <input
                    type="number"
                    min={0}
                    value={colWip}
                    onChange={(e) => setColWip(Number(e.target.value))}
                    className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setNewColumnModal(false)} className="px-3 py-1.5 rounded text-xs hover:bg-secondary">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold">Create Column</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Add Task Modal */}
        {quickAddModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
              <h3 className="font-bold text-base">Quick Add Task</h3>
              <form onSubmit={handleQuickAddTask} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Task Title</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Implement OAuth2 Refresh token rotation"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Priority Level</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setQuickAddModal({ open: false, columnId: null })} className="px-3 py-1.5 rounded text-xs hover:bg-secondary">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold">Save Task</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};
