import React from 'react';
import { useDrop } from 'react-dnd';
import { AlertTriangle, Plus } from 'lucide-react';
import { BoardColumn, Task } from '@/types';
import { TaskCard } from './TaskCard';

interface Props {
  column: BoardColumn;
  tasks: Task[];
  onTaskDrop: (taskId: number, targetColumnId: number) => void;
  onSelectTask: (taskId: number) => void;
  onQuickAdd: (columnId: number) => void;
}

export const KanbanColumn: React.FC<Props> = ({ column, tasks, onTaskDrop, onSelectTask, onQuickAdd }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'TASK_CARD',
    drop: (item: { taskId: number; currentColumnId?: number }) => {
      if (item.currentColumnId !== column.id) {
        onTaskDrop(item.taskId, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [column.id, onTaskDrop]);

  const isWipExceeded = column.wip_limit > 0 && tasks.length > column.wip_limit;

  return (
    <div
      ref={(node) => { drop(node); }}
      className={`flex flex-col w-72 md:w-80 shrink-0 bg-secondary/40 rounded-xl border transition-colors max-h-full ${
        isOver && canDrop
          ? 'border-primary bg-primary/10'
          : isWipExceeded
          ? 'border-amber-500/40 bg-amber-500/10'
          : 'border-border'
      }`}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-surface rounded-t-xl z-10">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-heading truncate">{column.name}</h3>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isWipExceeded ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-secondary text-muted'
            }`}
          >
            {tasks.length} {column.wip_limit > 0 ? `/ ${column.wip_limit}` : ''}
          </span>
        </div>

        <button
          onClick={() => onQuickAdd(column.id)}
          className="p-1 rounded hover:bg-secondary text-muted hover:text-primary transition-colors"
          title="Add Task to Column"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* WIP Limit Alert Banner */}
      {isWipExceeded && (
        <div className="px-3 py-1.5 bg-amber-100/80 text-amber-900 text-[10px] font-bold flex items-center gap-1.5 border-b border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>WIP Limit Exceeded ({tasks.length}/{column.wip_limit})</span>
        </div>
      )}

      {/* Column Tasks Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-border/70 rounded-xl flex items-center justify-center text-xs text-muted/70 italic">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
