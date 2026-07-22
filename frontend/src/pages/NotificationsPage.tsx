import React from 'react';
import { useNotificationStore } from '@/store';
import { Bell, CheckCircle2, Clock, Check, AlertCircle, MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5 text-heading">
            <Bell className="w-6 h-6 text-primary" /> Activity Feed & Notifications
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time audit log of task assignments, code review comments, and workspace invitations (`{unreadCount}` unread)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="px-3.5 py-1.5 rounded-lg bg-surface border border-border text-heading hover:bg-secondary text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Mark All as Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="px-3.5 py-1.5 rounded-lg bg-red-500/15 text-red-600 hover:bg-red-500/25 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Feed
            </button>
          )}
        </div>
      </div>

      {/* Notifications Roster */}
      <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden divide-y divide-border/70">
        {notifications.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-heading">You are all caught up!</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              No new alerts or task notifications in your feed. When teammates comment on tasks or assign tickets to your account, instant notifications will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-4 flex items-start gap-4 transition-colors cursor-pointer ${
                notif.is_read ? 'bg-surface hover:bg-secondary/40' : 'bg-primary/10 hover:bg-primary/15 border-l-2 border-primary'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                notif.is_read ? 'bg-secondary text-muted' : 'bg-primary/20 text-primary'
              }`}>
                {getIcon(notif.notification_type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold ${notif.is_read ? 'text-heading' : 'text-primary'}`}>
                    {notif.title || 'System Notification'}
                  </h4>
                  <span className="text-[10px] font-mono text-muted flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" title="Unread" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
