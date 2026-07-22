import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { KanbanPage } from '@/pages/KanbanPage';
import { TaskListPage } from '@/pages/TaskListPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { TimeTrackingPage } from '@/pages/TimeTrackingPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { TeamPage } from '@/pages/TeamPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { AiCopilotPage } from '@/pages/AiCopilotPage';
import { SettingsPage } from '@/pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30s
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, user, token } = useAuthStore();
  if (isLoading || (token && !user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4 font-sans">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-sm" />
        <span className="text-sm font-semibold text-muted-foreground tracking-tight">Verifying enterprise session...</span>
      </div>
    );
  }
  // Allow guest access (`bina login ke bhi entry ho jaye`), prompting for login only on task/project creation actions
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/list" element={<TaskListPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/timetracking" element={<TimeTrackingPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/ai-copilot" element={<AiCopilotPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
