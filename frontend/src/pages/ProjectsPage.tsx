import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { projectApi } from '@/services/api';
import { Project } from '@/types';
import {
  FolderKanban, Plus, Search, ArrowUpRight, CheckCircle2,
  Users, Activity, Loader2, Sparkles
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace, projects, setCurrentProject, createProject } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projKey, setProjKey] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [template, setTemplate] = useState<'SCRUM' | 'KANBAN' | 'ROADMAP'>('SCRUM');
  const [isCreating, setIsCreating] = useState(false);

  const { data: projectsList = projects, isLoading, refetch } = useQuery({
    queryKey: ['projects_page_list', currentWorkspace?.id],
    queryFn: () => projectApi.list(currentWorkspace?.id),
    enabled: !!currentWorkspace?.id,
  });

  const filteredProjects = projectsList.filter((p: Project) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !projName || !projKey) return;
    setIsCreating(true);
    try {
      const created = await createProject({
        workspace_id: currentWorkspace.id,
        name: projName,
        key: projKey.toUpperCase().slice(0, 5),
        description: projDesc || `Initialized with ${template} architecture template.`,
      });
      setNewProjectModal(false);
      setProjName('');
      setProjKey('');
      setProjDesc('');
      refetch();
      if (created) {
        setCurrentProject(created);
        navigate('/kanban');
      }
    } catch {
      alert('Failed to create project. Verify inputs and permissions.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/20">
              Workspace Directory
            </span>
            <span className="text-xs text-muted font-medium">• Portfolio Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-heading mt-1 flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-primary" /> Engineering Projects
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Inspect all agile repositories, sprint boards, and health indicators across your workspace.
          </p>
        </div>

        <button
          onClick={() => setNewProjectModal(true)}
          className="px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover text-xs font-semibold flex items-center gap-2 shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4 p-3.5 bg-surface border border-border rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted ml-2" />
          <input
            type="text"
            placeholder="Search projects by name or key (e.g. MOB, ENT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-medium text-heading placeholder:text-muted"
          />
        </div>
        <div className="text-xs font-bold text-muted px-2">
          Showing `{filteredProjects.length}` Project(s)
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs font-semibold text-muted">Loading workspace repositories...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="enterprise-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center mx-auto">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-heading">No Projects Found</h3>
          <p className="text-xs text-muted">
            {searchQuery
              ? `No projects match "${searchQuery}". Try adjusting your search query.`
              : 'Your workspace currently has no active projects. Initialize your first Agile/Scrum or Kanban board now.'}
          </p>
          <button
            onClick={() => setNewProjectModal(true)}
            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Initialize Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj: Project) => (
            <div
              key={proj.id}
              onClick={() => { setCurrentProject(proj); navigate('/kanban'); }}
              className="enterprise-card p-5 hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-primary/15 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                      {proj.key}
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Healthy
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-heading group-hover:text-primary transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || 'Full-scale Agile board with custom sprint planning, backlog management, and real-time WebSocket state.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>Engineering Team</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] bg-secondary px-2 py-0.5 rounded font-bold text-heading">
                  <Activity className="w-3 h-3 text-emerald-500" /> Active Board
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {newProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn p-4">
          <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-heading">Initialize New Engineering Project</h3>
                <p className="text-xs text-muted">Select workflow template and configure repository key</p>
              </div>
              <span className="text-[10px] bg-primary/15 text-primary border border-primary/20 font-bold px-2.5 py-1 rounded">Agile Setup</span>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Banking Platform Redesign"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-heading block mb-1">Project Key (Prefix)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. CBR"
                    value={projKey}
                    onChange={(e) => setProjKey(e.target.value.toUpperCase())}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-[10px] text-muted mt-1">Used for task IDs (e.g. CBR-101)</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-heading block mb-1">Architecture Template</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-bold text-heading focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="SCRUM">Scrum Agile (Sprints & Backlog)</option>
                    <option value="KANBAN">Continuous Kanban Board</option>
                    <option value="ROADMAP">Product Roadmap & Milestones</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-heading block mb-1">Project Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize project scope and engineering objectives..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setNewProjectModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-secondary text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-hover shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Initialize Repository</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
