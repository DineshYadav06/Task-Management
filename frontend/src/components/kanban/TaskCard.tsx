import React from 'react';
import { useDrag } from 'react-dnd';
import { Clock, Paperclip, MessageSquare, CheckSquare, AlertCircle } from 'lucide-react';
import { Task } from '@/types';
import { format } from 'date-fns';

interface Props {
  task: Task;
  onClick: () => void;
}

const priorityBadge: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'bg-secondary/80', text: 'text-foreground', border: 'border-border' },
  MEDIUM: { bg: 'bg-primary/15', text: 'text-primary', border: 'border-primary/20' },
  HIGH: { bg: 'bg-amber-500/15', text: 'text-amber-600 font-bold', border: 'border-amber-500/20' },
  URGENT: { bg: 'bg-red-500/15', text: 'text-red-600 font-bold', border: 'border-red-500/20' },
};

const severityBadge: Record<string, { bg: string; text: string }> = {
  BLOCKER: { bg: 'bg-red-600', text: 'text-white font-bold' },
  CRITICAL: { bg: 'bg-red-500', text: 'text-white font-bold' },
  MAJOR: { bg: 'bg-amber-500', text: 'text-black font-semibold' },
  MINOR: { bg: 'bg-secondary', text: 'text-foreground' },
  TRIVIAL: { bg: 'bg-secondary/70', text: 'text-muted font-medium' },
};

export const TaskCard: React.FC<Props> = ({ task, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK_CARD',
    item: { taskId: task.id, currentColumnId: task.column_id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [task.id, task.column_id]);

  const pStyle = priorityBadge[task.priority] || priorityBadge.MEDIUM;
  const completedChecklists = task.checklists?.reduce((acc, cl) => acc + cl.items.filter(i => i.is_completed).length, 0) || 0;
  const totalChecklists = task.checklists?.reduce((acc, cl) => acc + cl.items.length, 0) || 0;

  return (
    <div
      ref={(node) => { drag(node); }}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className="p-3.5 rounded-xl bg-surface border border-border hover:border-primary/50 shadow-2xs hover:shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-2.5 group select-none"
    >
      {/* Card Header: Task Key & Badges */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold text-muted group-hover:text-primary transition-colors">
          TASK-{task.id}
        </span>
        <div className="flex items-center gap-1.5">
          {task.severity && task.severity !== 'MINOR' && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${severityBadge[task.severity]?.bg || 'bg-secondary'} ${severityBadge[task.severity]?.text || 'text-foreground'}`}>
              {task.severity}
            </span>
          )}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="font-semibold text-xs leading-snug text-heading group-hover:text-primary transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Story Points & Due Date Chip */}
      <div className="flex items-center gap-2">
        {task.story_points > 0 && (
          <span className="inline-block px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono font-bold text-muted">
            {task.story_points} pt{task.story_points > 1 ? 's' : ''}
          </span>
        )}
        {task.due_date && (
          <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${
            new Date(task.due_date) < new Date() && task.status !== 'DONE'
              ? 'bg-red-500/15 text-red-600 border border-red-500/20'
              : 'bg-secondary text-muted'
          }`}>
            <Clock className="w-2.5 h-2.5" />
            {format(new Date(task.due_date), 'MMM dd')}
          </span>
        )}
      </div>

      {/* Footer: Metadata Indicators & Assignee Avatar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border/70 text-[11px] text-muted">
        <div className="flex items-center gap-3">
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 hover:text-heading" title="Comments">
              <MessageSquare className="w-3 h-3 text-muted" /> {task.comments.length}
            </span>
          )}
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 hover:text-heading" title="Attachments">
              <Paperclip className="w-3 h-3 text-muted" /> {task.attachments.length}
            </span>
          )}
          {totalChecklists > 0 && (
            <span className={`flex items-center gap-1 font-semibold ${
              completedChecklists === totalChecklists ? 'text-emerald-600' : 'text-muted'
            }`} title="Checklists progress">
              <CheckSquare className="w-3 h-3" /> {completedChecklists}/{totalChecklists}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className="w-6 h-6 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shadow-2xs"
            title={`Assigned to ${task.assignee?.full_name || task.assignee?.username || 'Member'}`}
          >
            {task.assignee?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};
