import React from 'react';
import { useDrop } from 'react-dnd';
import { AlertTriangle, Plus, MoreHorizontal } from 'lucide-react';
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
      className={`flex flex-col w-72 md:w-80 shrink-0 bg-secondary/20 rounded-2xl border transition-colors max-h-full ${
        isOver && canDrop ? 'border-primary bg-primary/5' : isWipExceeded ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/60'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-border/60 flex items-center justify-between sticky top-0 bg-card/40 backdrop-blur-sm rounded-t-2xl z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">{column.name}</h3>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isWipExceeded ? 'bg-amber-500 text-black animate-pulse' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {tasks.length} {column.wip_limit > 0 ? `/ ${column.wip_limit}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onQuickAdd(column.id)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Add Task to Column"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WIP Exceeded Alert banner */}
      {isWipExceeded && (
        <div className="px-3 py-1.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1.5 border-b border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>WIP Limit Exceeded! Bottleneck risk.</span>
        </div>
      )}

      {/* Column Tasks List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[160px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-border/40 rounded-xl flex items-center justify-center text-xs text-muted-foreground/60 italic">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
