import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Layers, Kanban, ListTodo, Calendar as CalendarIcon, BarChart3, Clock,
  Sparkles, Bell, Search, Sun, Moon, LogOut, ChevronDown, Plus, Folder, Building2
} from 'lucide-react';
import { useAuthStore, useAppStore, useNotificationStore } from '@/store';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { NotificationDrawer } from '@/components/common/NotificationDrawer';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    theme, toggleTheme, organizations, currentOrg, setCurrentOrg,
    workspaces, currentWorkspace, setCurrentWorkspace,
    projects, currentProject, setCurrentProject, createProject, fetchOrganizations
  } = useAppStore();
  const { unreadCount, fetchNotifications, initSocketListeners } = useNotificationStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projKey, setProjKey] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchOrganizations();
    fetchNotifications();
    initSocketListeners();
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !projName || !projKey) return;
    try {
      await createProject({
        workspace_id: currentWorkspace.id,
        name: projName,
        key: projKey.toUpperCase().slice(0, 5),
      });
      setNewProjectModal(false);
      setProjName('');
      setProjKey('');
    } catch (err) {
      alert('Failed to create project. Please verify inputs.');
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 z-20">
        {/* Brand */}
        <div className="h-16 px-4 border-b border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold shadow-md shadow-primary/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight leading-none">TaskMaster</h1>
              <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Enterprise SaaS</span>
            </div>
          </div>
        </div>

        {/* Organization & Workspace Switcher */}
        <div className="p-3 space-y-2 border-b border-border bg-secondary/20">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 mb-1">
              <Building2 className="w-3 h-3" /> Organization
            </label>
            <select
              value={currentOrg?.id || ''}
              onChange={(e) => {
                const org = organizations.find((o) => o.id === Number(e.target.value)) || null;
                setCurrentOrg(org);
              }}
              className="w-full text-xs font-semibold bg-background border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 mb-1">
              <Folder className="w-3 h-3" /> Workspace
            </label>
            <select
              value={currentWorkspace?.id || ''}
              onChange={(e) => {
                const ws = workspaces.find((w) => w.id === Number(e.target.value)) || null;
                setCurrentWorkspace(ws);
              }}
              className="w-full text-xs font-semibold bg-background border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Projects List */}
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Projects</span>
            <button
              onClick={() => setNewProjectModal(true)}
              className="p-1 rounded hover:bg-secondary text-primary hover:text-primary/80 transition-colors"
              title="Create New Project"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">No projects in workspace</p>
            ) : (
              projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => setCurrentProject(proj)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    currentProject?.id === proj.id
                      ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{proj.name}</span>
                  <span className="font-mono text-[10px] bg-secondary px-1 rounded">{proj.key}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-2">Views & Modules</div>
          
          <NavLink
            to="/kanban"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <Kanban className="w-4 h-4" /> Kanban Board
          </NavLink>

          <NavLink
            to="/list"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <ListTodo className="w-4 h-4" /> Table / List View
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <CalendarIcon className="w-4 h-4" /> Calendar & Timelines
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" /> Analytics & Reports
          </NavLink>

          <NavLink
            to="/timetracking"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <Clock className="w-4 h-4" /> Time Tracking
          </NavLink>

          <div className="pt-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-2">Intelligence</div>
            <NavLink
              to="/ai-copilot"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-purple-400 hover:bg-purple-500/10 hover:text-purple-300'
                }`
              }
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> AI Copilot Studio
            </NavLink>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border bg-secondary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.full_name || user?.username}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.role || 'Member'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground text-xs transition-colors border border-border/50 w-64 md:w-80"
            >
              <Search className="w-4 h-4" />
              <span>Search tasks, projects... (Ctrl+K)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/ai-copilot')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Assistant
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={() => setNotifOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-ping" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold">{user?.full_name || user?.username}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTask={(taskId) => {
          navigate(`/kanban?task=${taskId}`);
        }}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onSelectTask={(taskId) => {
          navigate(`/kanban?task=${taskId}`);
        }}
      />

      {/* New Project Modal */}
      {newProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Redesign"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Project Key (Prefix)</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g. MOB"
                  value={projKey}
                  onChange={(e) => setProjKey(e.target.value.toUpperCase())}
                  className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewProjectModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-secondary text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
