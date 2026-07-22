import { create } from 'zustand';
import { NotificationItem } from '@/types';
import { notifApi } from '@/services/api';
import { socketService } from '@/services/socket';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addRealtimeNotification: (notif: NotificationItem) => void;
  initSocketListeners: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const items = await notifApi.list();
      const { unread_count } = await notifApi.getUnreadCount();
      set({ notifications: items, unreadCount: unread_count, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { unread_count } = await notifApi.getUnreadCount();
      set({ unreadCount: unread_count });
    } catch {
      // ignore
    }
  },

  markAsRead: async (id) => {
    await notifApi.markRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await notifApi.markAllRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },

  addRealtimeNotification: (notif) => {
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + (notif.is_read ? 0 : 1),
    }));
  },

  initSocketListeners: () => {
    socketService.on('notification:new', (payload) => {
      get().addRealtimeNotification(payload);
    });
  },
}));
