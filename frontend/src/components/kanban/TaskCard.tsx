import React from 'react';
import { useDrag } from 'react-dnd';
import { Clock, Paperclip, MessageSquare, CheckSquare, AlertCircle, Sparkles } from 'lucide-react';
import { Task } from '@/types';

interface Props {
  task: Task;
  onClick: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  HIGH: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  URGENT: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const severityBadges: Record<string, string> = {
  BLOCKER: 'bg-red-600 text-white font-black animate-pulse',
  CRITICAL: 'bg-red-500 text-white font-bold',
  MAJOR: 'bg-amber-500 text-black font-semibold',
  MINOR: 'bg-slate-700 text-slate-200',
  TRIVIAL: 'bg-slate-800 text-slate-400',
};

export const TaskCard: React.FC<Props> = ({ task, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK_CARD',
    item: { taskId: task.id, currentColumnId: task.column_id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [task.id, task.column_id]);

  return (
    <div
      ref={(node) => { drag(node); }}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="p-3.5 rounded-xl bg-card border border-border/80 hover:border-primary/60 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2.5 group"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
          TASK-{task.id}
        </span>
        <div className="flex items-center gap-1.5">
          {task.severity && task.severity !== 'MINOR' && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${severityBadges[task.severity] || ''}`}>
              {task.severity}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <h4 className="font-semibold text-xs leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {task.title}
      </h4>

      {task.story_points > 0 && (
        <div className="inline-block px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono font-bold text-muted-foreground">
          {task.story_points} pt{task.story_points > 1 ? 's' : ''}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 hover:text-foreground">
              <MessageSquare className="w-3 h-3" /> {task.comments.length}
            </span>
          )}
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 hover:text-foreground">
              <Paperclip className="w-3 h-3" /> {task.attachments.length}
            </span>
          )}
          {task.checklists?.length > 0 && (
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <CheckSquare className="w-3 h-3" /> {task.checklists.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]" title="Assignee">
            {task.assignee?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};
