import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Layers, LayoutDashboard, FolderKanban, Kanban, ListTodo, Calendar as CalendarIcon,
  BarChart3, Clock, Users, Bell, Settings, Sparkles, Search, Sun, Moon,
  LogOut, ChevronDown, ChevronRight, ChevronLeft, Plus, Folder, Building2, HelpCircle, MessageSquare, CheckSquare, GitCommit, TrendingUp
} from 'lucide-react';
import { useAuthStore, useAppStore, useNotificationStore } from '@/store';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { NotificationDrawer } from '@/components/common/NotificationDrawer';
import { QuickCreateTaskModal } from '@/components/task/QuickCreateTaskModal';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoginPromptModal } from '@/components/auth/LoginPromptModal';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const {
    theme, toggleTheme, organizations, currentOrg, setCurrentOrg,
    workspaces, currentWorkspace, setCurrentWorkspace,
    projects, currentProject, setCurrentProject, createProject, fetchOrganizations
  } = useAppStore();
  const { unreadCount, fetchNotifications, initSocketListeners } = useNotificationStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasksMenuOpen, setTasksMenuOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginActionName, setLoginActionName] = useState('create tasks');
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
    } catch {
      alert('Failed to create project. Please verify inputs and permissions.');
    }
  };

  const isTasksActive = ['/kanban', '/list', '/calendar'].includes(location.pathname);

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Sidebar - Fixed, Collapsible, White background, Thin border */}
      <aside
        className={`bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-200 z-30 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Company Logo Header */}
        <div className="h-14 px-3.5 border-b border-border flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold shrink-0 shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-sm text-heading tracking-tight block leading-none truncate">TaskMaster</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mt-0.5">Enterprise Cloud</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-md text-muted hover:bg-secondary hover:text-foreground transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Selector */}
        {!sidebarCollapsed && (
          <div className="p-3 space-y-2 border-b border-border bg-secondary/30 shrink-0">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase flex items-center gap-1 mb-1">
                <Building2 className="w-3 h-3" /> Organization
              </label>
              <select
                value={currentOrg?.id || ''}
                onChange={(e) => {
                  const org = organizations.find((o) => o.id === Number(e.target.value)) || null;
                  setCurrentOrg(org);
                }}
                className="w-full text-xs font-semibold bg-surface text-heading border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted uppercase flex items-center gap-1 mb-1">
                <Folder className="w-3 h-3" /> Active Workspace
              </label>
              <select
                value={currentWorkspace?.id || ''}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === Number(e.target.value)) || null;
                  setCurrentWorkspace(ws);
                }}
                className="w-full text-xs font-semibold bg-surface text-heading border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Projects List (Collapsed or Expanded) */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Projects</span>
              <button
                onClick={() => setNewProjectModal(true)}
                className="p-1 rounded hover:bg-secondary text-primary hover:text-primary-hover transition-colors"
                title="Create New Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 max-h-32 overflow-y-auto pr-1">
              {projects.length === 0 ? (
                <p className="text-xs text-muted font-medium italic py-1.5 px-2.5 bg-secondary/60 rounded-md border border-border/50">No active projects</p>
              ) : (
                projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => setCurrentProject(proj)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-all ${
                      currentProject?.id === proj.id
                        ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                        : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    <span className="font-mono text-[9px] bg-secondary px-1 py-0.5 rounded text-muted uppercase font-bold">{proj.key}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && <div className="text-[10px] font-bold text-muted uppercase px-2 mb-1.5">Views & Tools</div>}
          
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all text-foreground hover:bg-secondary`
            }
            title={sidebarCollapsed ? 'Home Page' : ''}
          >
            <Layers className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Main Home</span>}
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                isActive
                  ? 'border-l-4 border-primary bg-primary/15 text-primary pl-2 font-bold'
                  : 'text-foreground hover:bg-secondary'
              }`
            }
            title={sidebarCollapsed ? 'Dashboard' : ''}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                isActive
                  ? 'border-l-4 border-primary bg-primary/15 text-primary pl-2 font-bold'
                  : 'text-foreground hover:bg-secondary'
              }`
            }
            title={sidebarCollapsed ? 'Projects' : ''}
          >
            <FolderKanban className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Projects Directory</span>}
          </NavLink>

          {/* Collapsible Tasks Sub-menu */}
          <div>
            <button
              onClick={() => !sidebarCollapsed && setTasksMenuOpen(!tasksMenuOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                isTasksActive ? 'text-primary font-bold bg-secondary/40' : 'text-foreground hover:bg-secondary'
              }`}
              title={sidebarCollapsed ? 'Tasks views' : ''}
            >
              <div className="flex items-center gap-3">
                <Kanban className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Tasks & Boards</span>}
              </div>
              {!sidebarCollapsed && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${tasksMenuOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {!sidebarCollapsed && tasksMenuOpen && (
              <div className="pl-7 pr-1 py-1 space-y-0.5 border-l border-border ml-4 my-1">
                <NavLink
                  to="/kanban"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md font-medium transition-all ${
                      isActive ? 'bg-primary/15 text-primary font-bold border border-primary/20' : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                    }`
                  }
                >
                  <Kanban className="w-3.5 h-3.5 text-primary" /> Kanban Board
                </NavLink>
                <NavLink
                  to="/list"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md font-medium transition-all ${
                      isActive ? 'bg-primary/15 text-primary font-bold border border-primary/20' : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                    }`
                  }
                >
                  <ListTodo className="w-3.5 h-3.5 text-emerald-600" /> My Tasks & Grid
                </NavLink>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md font-medium transition-all ${
                      isActive ? 'bg-primary/15 text-primary font-bold border border-primary/20' : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                    }`
                  }
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-500" /> Calendar
                </NavLink>
                <NavLink
                  to="/calendar?view=timeline"
                  className={() =>
                    `flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md font-medium transition-all ${
                      location.search.includes('timeline') ? 'bg-primary/15 text-primary font-bold border border-primary/20' : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                    }`
                  }
                >
                  <GitCommit className="w-3.5 h-3.5 text-purple-600" /> Timeline
                </NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                isActive
                  ? 'border-l-4 border-primary bg-primary/15 text-primary pl-2 font-bold'
                  : 'text-foreground hover:bg-secondary'
              }`
            }
            title={sidebarCollapsed ? 'Reports & Analytics' : ''}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Reports & Analytics</span>}
          </NavLink>

          <NavLink
            to="/timetracking"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                isActive
                  ? 'border-l-4 border-primary bg-primary/15 text-primary pl-2 font-bold'
                  : 'text-foreground hover:bg-secondary'
              }`
            }
            title={sidebarCollapsed ? 'Time Tracking' : ''}
          >
            <Clock className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Time Tracking</span>}
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                isActive
                  ? 'border-l-4 border-primary bg-primary/15 text-primary pl-2 font-bold'
                  : 'text-foreground hover:bg-secondary'
              }`
            }
            title={sidebarCollapsed ? 'Team Management' : ''}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Teams & Organization</span>}
          </NavLink>

          <button
            onClick={() => { setNotifOpen(true); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all text-foreground hover:bg-secondary"
            title={sidebarCollapsed ? 'Messages' : ''}
          >
            <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
            {!sidebarCollapsed && <span>Messages & Chat</span>}
          </button>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                isActive
                  ? 'border-l-4 border-primary bg-primary/15 text-primary pl-2 font-bold'
                  : 'text-foreground hover:bg-secondary'
              }`
            }
            title={sidebarCollapsed ? 'Notifications' : ''}
          >
            <div className="relative flex items-center gap-3 w-full">
              <Bell className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="flex-1">Notifications</span>}
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white font-mono font-bold text-[9px] flex items-center justify-center shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </NavLink>

          <div className="pt-2 border-t border-border mt-2">
            {!sidebarCollapsed && <div className="text-[10px] font-bold text-muted uppercase px-2 mb-1.5">Intelligence & Admin</div>}
            
            <NavLink
              to="/ai-copilot"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? 'border-l-4 border-purple-600 bg-purple-50 text-purple-700 pl-2 font-bold'
                    : 'text-purple-600 hover:bg-purple-500/10'
                }`
              }
              title={sidebarCollapsed ? 'AI Copilot' : ''}
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              {!sidebarCollapsed && <span>AI Assistant</span>}
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? 'border-l-4 border-primary bg-primary/15 text-primary pl-2 font-bold'
                    : 'text-foreground hover:bg-secondary'
                }`
              }
              title={sidebarCollapsed ? 'Settings' : ''}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </NavLink>

            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all text-foreground hover:bg-secondary"
              title={sidebarCollapsed ? 'Help & Support' : ''}
            >
              <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              {!sidebarCollapsed && <span>Help & Docs</span>}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-border bg-secondary/30 flex items-center justify-between shrink-0">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-heading truncate leading-tight">{user?.full_name || user?.username}</p>
                  <p className="text-[10px] text-muted truncate">{user?.role || 'Member'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md hover:bg-red-500/10 text-muted hover:text-red-600 transition-colors shrink-0"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={logout}
              className="w-full py-1 rounded-md hover:bg-red-500/10 text-muted hover:text-red-600 transition-colors flex justify-center"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky White Navbar */}
        <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted text-xs font-medium border border-border w-full max-w-md transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-muted" />
                <span>Search tasks, issues, projects...</span>
              </div>
              <kbd className="hidden sm:inline-block font-mono font-bold text-[10px] bg-surface border border-border rounded px-1.5 py-0.5 text-muted">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Workspace Selector Indicator for Navbar */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/60 border border-border text-xs font-semibold text-heading">
              <Folder className="w-3.5 h-3.5 text-primary" />
              <span className="truncate max-w-[120px]">{currentWorkspace?.name || 'Workspace'}</span>
            </div>

            {/* Quick Create Task Button */}
            <button
              onClick={() => {
                if (!isAuthenticated || !user) {
                  setLoginActionName('create tasks');
                  setLoginPromptOpen(true);
                } else {
                  setCreateTaskModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-xs transition-all"
              title="Create Task (Ctrl + N)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create Task</span>
            </button>

            {/* Quick Create Project Button */}
            <button
              onClick={() => {
                if (!isAuthenticated || !user) {
                  setLoginActionName('create projects');
                  setLoginPromptOpen(true);
                } else {
                  setNewProjectModal(true);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-secondary text-heading font-semibold text-xs shadow-2xs transition-all"
              title="Create Project"
            >
              <FolderKanban className="w-3.5 h-3.5 text-primary" />
              <span className="hidden md:inline">Create Project</span>
            </button>

            <button
              onClick={() => navigate('/ai-copilot')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 hover:bg-purple-500/20 text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Assistant
            </button>

            <button
              onClick={() => setNotifOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary text-muted hover:text-heading transition-colors"
              title="Messages & Chat"
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary text-muted hover:text-heading transition-colors"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setNotifOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary text-muted hover:text-heading transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            {(!isAuthenticated || !user) ? (
              <div className="flex items-center gap-2 border-l border-border pl-2.5">
                <span className="hidden lg:inline-block text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Guest Mode
                </span>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="relative border-l border-border pl-2.5">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-md py-1.5 z-50 animate-fadeIn">
                    <div className="px-3.5 py-2 border-b border-border">
                      <p className="text-xs font-bold text-heading">{user?.full_name || user?.username}</p>
                      <p className="text-[10px] text-muted truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                      className="w-full text-left px-3.5 py-2 text-xs text-foreground hover:bg-secondary flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted" /> Profile & Preferences
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/team'); }}
                      className="w-full text-left px-3.5 py-2 text-xs text-foreground hover:bg-secondary flex items-center gap-2 font-medium"
                    >
                      <Users className="w-3.5 h-3.5 text-muted" /> Organization Management
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-500/10 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Area - Max width container inside */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {(!isAuthenticated || !user) && (
            <div className="mb-4 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs animate-fadeIn shadow-2xs">
              <div className="flex items-center gap-2 text-foreground">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>
                  <strong>Read-Only Mode:</strong> You are currently viewing the application in read-only mode. Please sign in to create tasks, manage projects, or save changes.
                </span>
              </div>
              <div className="flex gap-2 shrink-0 ml-3">
                <button
                  onClick={() => navigate('/')}
                  className="px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-heading font-bold transition-all border border-border shadow-xs"
                >
                  Exit to Home
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-xs"
                >
                  Sign In / Register
                </button>
              </div>
            </div>
          )}
          <div className="enterprise-container">
            <ErrorBoundary fallbackTitle="Page Display Error">
              <Outlet />
            </ErrorBoundary>
          </div>
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

      {/* Quick Create Task Modal */}
      <QuickCreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
      />

      {/* New Project Modal */}
      {newProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-heading">Create New Project</h3>
              <span className="text-[10px] bg-primary/15 text-primary font-bold px-2 py-0.5 rounded border border-primary/20">Scrum / Kanban</span>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Platform V2"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Project Key Prefix</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g. ENT"
                  value={projKey}
                  onChange={(e) => setProjKey(e.target.value.toUpperCase())}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-primary outline-none uppercase"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setNewProjectModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-secondary text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-hover shadow-xs"
                >
                  Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Required Prompt Modal for Guest Users */}
      <LoginPromptModal
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        actionName={loginActionName}
      />
    </div>
  );
};
