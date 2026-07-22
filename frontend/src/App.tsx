import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { KanbanPage } from '@/pages/KanbanPage';
import { TaskListPage } from '@/pages/TaskListPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { TimeTrackingPage } from '@/pages/TimeTrackingPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AiCopilotPage } from '@/pages/AiCopilotPage';

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
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/kanban" replace />} />
      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/list" element={<TaskListPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/timetracking" element={<TimeTrackingPage />} />
        <Route path="/ai-copilot" element={<AiCopilotPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/kanban" replace />} />
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
