import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import api from '@/services/api';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { Calendar as CalendarIcon, Loader2, FolderKanban, ListTodo, Plus } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject } = useAppStore();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['calendar_events', currentProject?.id],
    queryFn: async () => {
      const res = await api.get('/calendar/events', {
        params: currentProject ? { project_id: currentProject.id } : {},
      });
      return res.data;
    },
  });

  const handleEventClick = (info: any) => {
    const props = info.event.extendedProps;
    if (props && props.task_id) {
      setSelectedTaskId(props.task_id);
    }
  };

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center mb-1 shadow-sm">
          <CalendarIcon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-heading">No Project Selected</h3>
        <p className="text-muted text-xs max-w-md leading-relaxed">
          Select an active engineering project from the left sidebar to inspect sprint schedules and milestone deadlines on the interactive calendar.
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
    <div className="h-full flex flex-col space-y-4 animate-fadeIn pb-12">
      {/* Header with View Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded">
              {currentProject.key}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-heading">Milestone Timeline & Calendar</h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {currentProject.name} — Visual deadline tracking across day, week, and monthly cycles
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
              className="px-3 py-1 rounded-md text-muted hover:text-heading flex items-center gap-1.5 transition-colors"
            >
              <ListTodo className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="px-3 py-1 rounded-md bg-primary/15 text-primary font-bold flex items-center gap-1.5"
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Surface Container */}
      <div className="flex-1 bg-surface border border-border rounded-xl p-5 shadow-2xs overflow-hidden flex flex-col min-h-[600px]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto font-sans text-xs">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              dayMaxEvents={3}
            />
          </div>
        )}
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
