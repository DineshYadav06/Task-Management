import React, { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { taskApi, orgApi, aiApi } from '@/services/api';
import { useAppStore, useAuthStore } from '@/store';
import { TaskStatus } from '@/types';
import { X, Plus, AlertCircle, Calendar, Flag, Hash, User, Sparkles, CheckSquare } from 'lucide-react';

interface QuickCreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
  initialData?: any;
}

export const QuickCreateTaskModal: React.FC<QuickCreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultStatus = 'TODO',
  initialData = null,
}) => {
  const queryClient = useQueryClient();
  const { currentProject, currentWorkspace } = useAppStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>(initialData?.priority || 'MEDIUM');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<number | undefined>(user?.id);
  const [tagsInput, setTagsInput] = useState('enterprise, engineering');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch organization members for assignment
  const { data: members = [] } = useQuery({
    queryKey: ['workspace_members', currentWorkspace?.organization_id],
    queryFn: () => currentWorkspace?.organization_id ? orgApi.listMembers(currentWorkspace.organization_id) : Promise.resolve([]),
    enabled: !!currentWorkspace?.organization_id && isOpen,
  });

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setPriority(initialData?.priority || 'MEDIUM');
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!currentProject?.id && !currentWorkspace?.id) {
      setError('Please select an active project or workspace first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await taskApi.create({
        project_id: currentProject?.id || 1,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        story_points: Number(storyPoints) || undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        assignee_id: assigneeId,
        tags,
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['kanban_tasks'] });

      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create task. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-slideUp my-8">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-2xs font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-heading leading-tight">Create Enterprise Task</h3>
              <p className="text-[11px] text-muted">
                {currentProject ? `Project: ${currentProject.name} (${currentProject.key})` : 'Universal Workspace Task'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/20 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-heading block mb-1">
              Task Summary / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement OAuth2 Refresh Token Queue & Enterprise Guard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-semibold text-heading focus:ring-2 focus:ring-primary outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-heading">
                Detailed Description & Acceptance Criteria
              </label>
              <button
                type="button"
                onClick={async () => {
                  if (!title.trim()) {
                    setError('Enter a Task Title first so AI can generate specs!');
                    return;
                  }
                  setAiGenerating(true);
                  setError(null);
                  try {
                    const descRes = await aiApi.generateDescription(description || title);
                    if (descRes && descRes.description) {
                      setDescription(descRes.description);
                    }
                    const prioRes = await aiApi.suggestPriority(title, descRes?.description || description || title);
                    if (prioRes && prioRes.priority) {
                      if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(prioRes.priority)) {
                        setPriority(prioRes.priority as any);
                      }
                    }
                  } catch (err) {
                    setError('AI suggestion unavailable right now. You can continue typing manually.');
                  } finally {
                    setAiGenerating(false);
                  }
                }}
                disabled={aiGenerating || !title.trim()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3 h-3 ${aiGenerating ? 'animate-spin' : ''}`} />
                {aiGenerating ? 'AI Copilot Working...' : '✨ AI Suggest Priority & Specs'}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Describe technical specs, story points breakdown, or edge cases..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-2xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-heading flex items-center gap-1 mb-1">
                <CheckSquare className="w-3 h-3 text-primary" /> Status Column
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-heading focus:ring-2 focus:ring-primary outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="DRAFT">Draft</option>
                <option value="TODO">TODO (Backlog)</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Code Review</option>
                <option value="DONE">Done / Deployed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-heading flex items-center gap-1 mb-1">
                <Flag className="w-3 h-3 text-amber-500" /> Priority Level
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-heading focus:ring-2 focus:ring-primary outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium / Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent (Blocker)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-heading flex items-center gap-1 mb-1">
                <Hash className="w-3 h-3 text-purple-500" /> Story Points
              </label>
              <select
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-heading focus:ring-2 focus:ring-primary outline-none transition-all shadow-2xs cursor-pointer"
              >
                {[1, 2, 3, 5, 8, 13, 21].map((pts) => (
                  <option key={pts} value={pts}>{pts} pt{pts > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-heading flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-blue-500" /> Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-heading focus:ring-2 focus:ring-primary outline-none transition-all shadow-2xs cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-heading flex items-center gap-1 mb-1">
                <User className="w-3 h-3 text-emerald-500" /> Assignee
              </label>
              <select
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-heading focus:ring-2 focus:ring-primary outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="">Unassigned</option>
                {user && <option value={user.id}>{user.full_name || user.username} (You)</option>}
                {members
                  .filter((m: any) => m.id !== user?.id)
                  .map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name || m.username} ({m.email})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-heading block mb-1">
              Tags & Classifications <span className="text-muted font-normal">(comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. backend, auth, refactor"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-heading focus:ring-2 focus:ring-primary outline-none transition-all shadow-2xs"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> AI auto-classifies tags & sprint velocity
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-secondary text-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-hover shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
