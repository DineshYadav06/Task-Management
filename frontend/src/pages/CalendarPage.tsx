import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import api from '@/services/api';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

export const CalendarPage: React.FC = () => {
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

  return (
    <div className="h-full flex flex-col space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" /> Enterprise Timeline & Calendar
          </h2>
          <p className="text-xs text-muted-foreground">
            {currentProject ? `${currentProject.name} deadlines and milestones` : 'All tasks calendar'}
          </p>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl p-4 shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
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
