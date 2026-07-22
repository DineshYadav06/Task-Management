import React from 'react';
import { Bell, CheckCheck, X, ExternalLink, Clock } from 'lucide-react';
import { useNotificationStore } from '@/store';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: number) => void;
}

export const NotificationDrawer: React.FC<Props> = ({ isOpen, onClose, onSelectTask }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl text-foreground">
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base">Activity & Notifications</h3>
            <span className="text-xs bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.is_read).length} unread
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" /> Read All
            </button>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Bell className="w-10 h-10 text-muted-foreground/30" />
              <span>No notifications yet. All clear!</span>
            </div>
          ) : (
            notifications.map((notif) => {
              const taskIdMatch = notif.link_url ? notif.link_url.match(/\d+/) : null;
              const taskId = taskIdMatch ? parseInt(taskIdMatch[0], 10) : null;

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    notif.is_read
                      ? 'bg-card border-border/60 opacity-75'
                      : 'bg-primary/5 border-primary/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">
                          {notif.notification_type}
                        </span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-foreground">{notif.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </span>

                        <div className="flex items-center gap-2">
                          {taskId && (
                            <button
                              onClick={() => {
                                markAsRead(notif.id);
                                onSelectTask(taskId);
                                onClose();
                              }}
                              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                              Inspect Task <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-[10px] text-muted-foreground hover:text-foreground underline"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
