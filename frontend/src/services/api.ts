import axios from 'axios';
import {
  User, Organization, Workspace, Project, Sprint, Task, BoardColumn,
  TimeLog, NotificationItem
} from '@/types';

const API_BASE = '/api/v1';

export const formatApiError = (err: any): string => {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;
  const data = err.response?.data;
  if (data?.detail) {
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: any) => {
          const field = item.loc && Array.isArray(item.loc) ? item.loc.slice(-1)[0] : 'Field';
          return `${field}: ${item.msg}`;
        })
        .join(' | ');
    }
  }
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }
  if (err.message && typeof err.message === 'string') {
    return err.message;
  }
  return 'Request encountered an error. Please check your credentials.';
};

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Response interceptor: auto-refresh queue on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
          const { access_token, refresh_token: new_refresh } = res.data;
          localStorage.setItem('access_token', access_token);
          if (new_refresh) localStorage.setItem('refresh_token', new_refresh);
          isRefreshing = false;
          onTokenRefreshed(access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          isRefreshing = false;
          refreshSubscribers = [];
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        isRefreshing = false;
        refreshSubscribers = [];
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  },
  register: async (data: { username: string; email: string; password: string; full_name?: string; role?: string }) => {
    const res = await api.post<User>('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  updateMe: async (data: Partial<User>) => {
    const res = await api.put<User>('/auth/me', data);
    return res.data;
  },
};

// Helper to ensure paginated responses or wrapped objects always return clean arrays
const safeArray = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

export const orgApi = {
  list: async () => safeArray((await api.get('/organizations')).data),
  create: async (data: { name: string; slug: string; plan?: string }) => (await api.post<Organization>('/organizations', data)).data,
  get: async (id: number) => (await api.get<Organization>(`/organizations/${id}`)).data,
  invite: async (id: number, email: string, org_role = 'Employee') => (await api.post(`/organizations/${id}/invite`, { email, org_role })).data,
  listMembers: async (id: number) => safeArray((await api.get(`/organizations/${id}/members`)).data),
};

export const wsApi = {
  list: async (org_id?: number) => safeArray((await api.get('/workspaces', { params: { org_id } })).data),
  create: async (data: { organization_id: number; name: string; description?: string; color?: string }) => (await api.post<Workspace>('/workspaces', data)).data,
  getAnalytics: async (id: number) => (await api.get(`/workspaces/${id}/analytics`)).data,
};

export const projectApi = {
  list: async (workspace_id?: number) => safeArray((await api.get('/projects', { params: { workspace_id } })).data),
  create: async (data: { workspace_id: number; name: string; key: string; description?: string }) => (await api.post<Project>('/projects', data)).data,
  get: async (id: number) => (await api.get<Project>(`/projects/${id}`)).data,
  getHealth: async (id: number) => (await api.get(`/projects/${id}/health`)).data,
};

export const sprintApi = {
  list: async (project_id?: number) => safeArray((await api.get('/sprints', { params: { project_id } })).data),
  create: async (data: { project_id: number; name: string; goal?: string; start_date: string; end_date: string }) => (await api.post<Sprint>('/sprints', data)).data,
  getBurndown: async (id: number) => (await api.get(`/sprints/${id}/burndown`)).data,
};

export const taskApi = {
  list: async (params?: { project_id?: number; assignee_id?: number; sprint_id?: number; column_id?: number; status?: string; page?: number }) => safeArray((await api.get('/tasks', { params })).data),
  create: async (data: Partial<Task> & Record<string, any>) => (await api.post<Task>('/tasks', data)).data,
  get: async (id: number) => (await api.get<Task>(`/tasks/${id}`)).data,
  update: async (id: number, data: Partial<Task>) => (await api.put<Task>(`/tasks/${id}`, data)).data,
  delete: async (id: number) => await api.delete(`/tasks/${id}`),
  addComment: async (id: number, content: string) => (await api.post(`/tasks/${id}/comments`, { content })).data,
  toggleReaction: async (taskId: number, commentId: number, emoji: string) => (await api.post(`/tasks/${taskId}/comments/${commentId}/reactions?emoji=${encodeURIComponent(emoji)}`)).data,
  addChecklist: async (id: number, title: string, items: { content: string }[]) => (await api.post(`/tasks/${id}/checklists`, { title, items })).data,
};

export const kanbanApi = {
  getColumns: async (project_id: number) => safeArray((await api.get('/kanban/columns', { params: { project_id } })).data),
  createColumn: async (data: { project_id: number; name: string; position: number; wip_limit?: number }) => (await api.post<BoardColumn>('/kanban/columns', data)).data,
  moveTask: async (task_id: number, target_column_id: number, target_sprint_id?: number) => (await api.post('/kanban/move', { task_id, target_column_id, target_sprint_id })).data,
};

export const timeApi = {
  startTimer: async (task_id: number, description?: string) => (await api.post<TimeLog>('/timetracking/start', { task_id, description })).data,
  stopTimer: async (time_log_id: number) => (await api.post<TimeLog>('/timetracking/stop', { time_log_id })).data,
  getLogs: async (task_id?: number) => safeArray((await api.get('/timetracking/logs', { params: { task_id } })).data),
  getTimesheet: async (week_start: string) => (await api.get('/timetracking/timesheet', { params: { week_start } })).data,
};

export const notifApi = {
  list: async (unread_only = false) => safeArray((await api.get('/notifications', { params: { unread_only } })).data),
  getUnreadCount: async () => (await api.get<{ unread_count: number }>('/notifications/unread-count')).data,
  markRead: async (id: number) => (await api.post(`/notifications/${id}/read`)).data,
  markAllRead: async () => (await api.post('/notifications/mark-all-read')).data,
};

export const aiApi = {
  summarizeTask: async (task_id: number) => (await api.post('/ai/summarize-task', { task_id })).data,
  suggestPriority: async (title: string, description: string) => (await api.post('/ai/suggest-priority', { title, description })).data,
  generateDescription: async (draft_notes: string) => (await api.post('/ai/generate-description', { draft_notes })).data,
};

export default api;
