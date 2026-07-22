import { create } from 'zustand';
import { Organization, Workspace, Project } from '@/types';
import { orgApi, wsApi, projectApi } from '@/services/api';
import { socketService } from '@/services/socket';

interface AppState {
  theme: 'dark' | 'light';
  organizations: Organization[];
  currentOrg: Organization | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  projects: Project[];
  currentProject: Project | null;
  isLoadingOrgs: boolean;
  isLoadingWorkspaces: boolean;
  isLoadingProjects: boolean;

  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  fetchOrganizations: () => Promise<void>;
  setCurrentOrg: (org: Organization | null) => Promise<void>;
  fetchWorkspaces: (orgId: number) => Promise<void>;
  setCurrentWorkspace: (ws: Workspace | null) => Promise<void>;
  fetchProjects: (wsId: number) => Promise<void>;
  setCurrentProject: (proj: Project | null) => void;
  createProject: (data: { workspace_id: number; name: string; key: string; description?: string }) => Promise<Project>;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  organizations: [],
  currentOrg: null,
  workspaces: [],
  currentWorkspace: null,
  projects: [],
  currentProject: null,
  isLoadingOrgs: false,
  isLoadingWorkspaces: false,
  isLoadingProjects: false,

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    set({ theme });
  },

  fetchOrganizations: async () => {
    set({ isLoadingOrgs: true });
    try {
      const orgs = await orgApi.list();
      set({ organizations: orgs, isLoadingOrgs: false });
      if (orgs.length > 0 && !get().currentOrg) {
        await get().setCurrentOrg(orgs[0]);
      }
    } catch {
      set({ isLoadingOrgs: false });
    }
  },

  setCurrentOrg: async (org) => {
    set({ currentOrg: org, workspaces: [], currentWorkspace: null, projects: [], currentProject: null });
    if (org) {
      await get().fetchWorkspaces(org.id);
    }
  },

  fetchWorkspaces: async (orgId) => {
    set({ isLoadingWorkspaces: true });
    try {
      const wss = await wsApi.list(orgId);
      set({ workspaces: wss, isLoadingWorkspaces: false });
      if (wss.length > 0 && !get().currentWorkspace) {
        await get().setCurrentWorkspace(wss[0]);
      }
    } catch {
      set({ isLoadingWorkspaces: false });
    }
  },

  setCurrentWorkspace: async (ws) => {
    set({ currentWorkspace: ws, projects: [], currentProject: null });
    if (ws) {
      await get().fetchProjects(ws.id);
    }
  },

  fetchProjects: async (wsId) => {
    set({ isLoadingProjects: true });
    try {
      const projs = await projectApi.list(wsId);
      set({ projects: projs, isLoadingProjects: false });
      if (projs.length > 0 && !get().currentProject) {
        get().setCurrentProject(projs[0]);
      }
    } catch {
      set({ isLoadingProjects: false });
    }
  },

  setCurrentProject: (proj) => {
    const prevProj = get().currentProject;
    if (prevProj) {
      socketService.unsubscribeRoom(`project_${prevProj.id}`);
    }
    if (proj) {
      socketService.subscribeRoom(`project_${proj.id}`);
    }
    set({ currentProject: proj });
  },

  createProject: async (data) => {
    const newProj = await projectApi.create(data);
    set((state) => ({ projects: [...state.projects, newProj] }));
    get().setCurrentProject(newProj);
    return newProj;
  },
}));
