import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { useAuthStore } from '@/store';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AppLayout } from '@/components/layout/AppLayout';
const LandingPage = React.lazy(() => import('@/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginPage = React.lazy(() => import('@/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage').then(module => ({ default: module.RegisterPage })));

const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import('@/pages/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const AdminLoginPage = React.lazy(() => import('@/pages/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })));
const AdminSignupPage = React.lazy(() => import('@/pages/AdminSignupPage').then(module => ({ default: module.AdminSignupPage })));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const ContactPage = React.lazy(() => import('@/pages/ContactPage').then(module => ({ default: module.ContactPage })));
const FeaturesPage = React.lazy(() => import('@/pages/FeaturesPage').then(module => ({ default: module.FeaturesPage })));
const PricingPage = React.lazy(() => import('@/pages/PricingPage').then(module => ({ default: module.PricingPage })));
const SolutionsPage = React.lazy(() => import('@/pages/SolutionsPage').then(module => ({ default: module.SolutionsPage })));
const GenericStaticPage = React.lazy(() => import('@/pages/GenericStaticPage').then(module => ({ default: module.GenericStaticPage })));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ProjectsPage = React.lazy(() => import('@/pages/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const KanbanPage = React.lazy(() => import('@/pages/KanbanPage').then(module => ({ default: module.KanbanPage })));
const TaskListPage = React.lazy(() => import('@/pages/TaskListPage').then(module => ({ default: module.TaskListPage })));
const CalendarPage = React.lazy(() => import('@/pages/CalendarPage').then(module => ({ default: module.CalendarPage })));
const TimeTrackingPage = React.lazy(() => import('@/pages/TimeTrackingPage').then(module => ({ default: module.TimeTrackingPage })));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const TeamPage = React.lazy(() => import('@/pages/TeamPage').then(module => ({ default: module.TeamPage })));
const NotificationsPage = React.lazy(() => import('@/pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const AiCopilotPage = React.lazy(() => import('@/pages/AiCopilotPage').then(module => ({ default: module.AiCopilotPage })));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));

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

const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [pathname, hash]);

  return null;
};

const AppRoutes: React.FC = () => {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4 font-sans">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-sm" />
        <span className="text-sm font-semibold text-muted-foreground tracking-tight">Loading Enterprise Environment...</span>
      </div>
    }>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        
        {/* Generic Static Pages */}
        <Route path="/resources" element={<GenericStaticPage />} />
        <Route path="/integrations" element={<GenericStaticPage />} />
        <Route path="/changelog" element={<GenericStaticPage />} />
        <Route path="/docs" element={<GenericStaticPage />} />
        <Route path="/about" element={<GenericStaticPage />} />
        <Route path="/careers" element={<GenericStaticPage />} />
        <Route path="/blog" element={<GenericStaticPage />} />
        <Route path="/partners" element={<GenericStaticPage />} />
        <Route path="/privacy" element={<GenericStaticPage />} />
        <Route path="/terms" element={<GenericStaticPage />} />
        <Route path="/cookies" element={<GenericStaticPage />} />
        <Route path="/security" element={<GenericStaticPage />} />

        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
        <Route path="/reset-password" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
        <Route path="/admin-login" element={<AuthLayout><AdminLoginPage /></AuthLayout>} />
        <Route path="/admin-signup" element={<AuthLayout><AdminSignupPage /></AuthLayout>} />

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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </React.Suspense>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollManager />
        <AppRoutes />
        <Analytics />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
