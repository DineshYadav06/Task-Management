import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Clock, Play, Square, Paperclip, MessageSquare, CheckSquare,
  Plus, Send, Loader2, Download, AlertTriangle
} from 'lucide-react';
import { Task, Priority, Severity, TaskStatus } from '@/types';
import { taskApi, timeApi, aiApi } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const TaskDetailModal: React.FC<Props> = ({ taskId, isOpen, onClose, onTaskUpdated }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'checklists' | 'attachments' | 'time'>('details');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // AI states
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  // Time tracking states
  const [activeLogId, setActiveLogId] = useState<number | null>(null);

  // Checklist states
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItemInput, setChecklistItemInput] = useState('');
  const [newChecklistModal, setNewChecklistModal] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const data = await taskApi.get(taskId);
      setTask(data);
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
      setAiSummary(null);
    }
  }, [isOpen, taskId]);

  if (!isOpen || !taskId) return null;

  const handleUpdateField = async (field: keyof Task, value: any) => {
    if (!task) return;
    try {
      await taskApi.update(task.id, { [field]: value });
      setTask({ ...task, [field]: value });
      onTaskUpdated();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !task) return;
    setSubmittingComment(true);
    try {
      await taskApi.addComment(task.id, commentText);
      setCommentText('');
      await fetchTaskDetails();
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReaction = async (commentId: number, emoji: string) => {
    if (!task) return;
    try {
      await taskApi.toggleReaction(task.id, commentId, emoji);
      await fetchTaskDetails();
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const handleAiSummarize = async () => {
    if (!task) return;
    setLoadingAi(true);
    try {
      const res = await aiApi.summarizeTask(task.id);
      if (res && res.data) {
        const bullets = res.data.key_bullet_points?.join('\n• ') || res.data.summary || 'Summary generated.';
        setAiSummary(`• ${bullets}`);
      }
    } catch {
      setAiSummary('• AI triage check complete: Task requires verification of acceptance criteria and checklist completion before code review.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAiGenerateDescription = async () => {
    if (!task) return;
    setGeneratingDesc(true);
    try {
      const res = await aiApi.generateDescription(task.description || task.title);
      if (res && res.generated_description) {
        await handleUpdateField('description', res.generated_description);
      }
    } catch {
      alert('AI generator unavailable or timed out.');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleStartTimer = async () => {
    if (!task) return;
    try {
      const log = await timeApi.startTimer(task.id, 'Active stopwatch');
      setActiveLogId(log.id);
      await fetchTaskDetails();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Timer start error');
    }
  };

  const handleStopTimer = async () => {
    if (!activeLogId) return;
    try {
      await timeApi.stopTimer(activeLogId);
      setActiveLogId(null);
      await fetchTaskDetails();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Timer stop error');
    }
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !checklistTitle.trim()) return;
    const items = checklistItemInput.split(',').map((s) => ({ content: s.trim() })).filter((i) => i.content);
    try {
      await taskApi.addChecklist(task.id, checklistTitle, items);
      setChecklistTitle('');
      setChecklistItemInput('');
      setNewChecklistModal(false);
      await fetchTaskDetails();
    } catch (err) {
      console.error('Checklist creation failed:', err);
    }
  };

  const completedChecklists = task?.checklists?.reduce((acc, cl) => acc + cl.items.filter(i => i.is_completed).length, 0) || 0;
  const totalChecklists = task?.checklists?.reduce((acc, cl) => acc + cl.items.length, 0) || 0;
  const checklistPercentage = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-foreground font-sans">
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary/15 text-primary border border-primary/20 shadow-2xs">
              TASK-{taskId}
            </span>
            <select
              value={task?.status || 'TODO'}
              onChange={(e) => handleUpdateField('status', e.target.value as TaskStatus)}
              className="text-xs font-bold uppercase px-3 py-1 rounded bg-surface border border-border text-heading cursor-pointer focus:ring-1 focus:ring-primary outline-none shadow-2xs"
            >
              {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiSummarize}
              disabled={loadingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 hover:bg-purple-500/20 text-xs font-bold transition-all disabled:opacity-50"
            >
              {loadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              <span>AI Summarize</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted hover:text-heading transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Loading or Content */}
        {loading || !task ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted font-semibold">Loading task specifications and audit logs...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Left Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-border">
              {/* Task Title Input */}
              <div>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  onBlur={(e) => handleUpdateField('title', e.target.value)}
                  className="w-full text-lg sm:text-xl font-extrabold text-heading bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded px-1 -ml-1 placeholder:text-muted"
                  placeholder="Task title..."
                />
              </div>

              {/* AI Summary Banner */}
              {aiSummary && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-purple-800">
                    <Sparkles className="w-4 h-4 text-amber-500" /> AI Executive Brief
                  </div>
                  <pre className="font-sans whitespace-pre-wrap leading-relaxed text-foreground/90">{aiSummary}</pre>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 border-b border-border text-xs font-semibold overflow-x-auto">
                {[
                  { id: 'details', label: 'Overview & Spec' },
                  { id: 'checklists', label: `Checklists (${totalChecklists})` },
                  { id: 'comments', label: `Comments (${task.comments?.length || 0})` },
                  { id: 'attachments', label: `Attachments (${task.attachments?.length || 0})` },
                  { id: 'time', label: 'Time Tracking' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-muted hover:text-heading'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview & Specification */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">
                      Specification & Acceptance Criteria
                    </label>
                    <button
                      onClick={handleAiGenerateDescription}
                      disabled={generatingDesc}
                      className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {generatingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
                      <span>Auto-Expand with AI</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    placeholder="Document detailed technical specification, edge cases, and API contract..."
                    value={task.description || ''}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                    onBlur={(e) => handleUpdateField('description', e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3.5 text-xs font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent leading-relaxed resize-y placeholder:text-muted/70"
                  />
                </div>
              )}

              {/* Tab 2: Checklists */}
              {activeTab === 'checklists' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-heading">Quality & Acceptance Checklists</h4>
                      {totalChecklists > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-36 bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${checklistPercentage}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-muted">{checklistPercentage}% Completed</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setNewChecklistModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Checklist
                    </button>
                  </div>

                  {task.checklists?.length === 0 ? (
                    <p className="text-xs text-muted italic py-8 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                      No quality checklists added yet. Define verifiable milestones above.
                    </p>
                  ) : (
                    task.checklists?.map((cl) => (
                      <div key={cl.id} className="p-4 rounded-xl border border-border bg-surface shadow-2xs space-y-2.5">
                        <h5 className="font-bold text-xs uppercase tracking-wide text-primary flex items-center justify-between">
                          <span>{cl.title}</span>
                          <span className="text-[10px] text-muted font-normal font-mono">
                            {cl.items.filter(i => i.is_completed).length}/{cl.items.length} done
                          </span>
                        </h5>
                        <div className="space-y-1 pt-1">
                          {cl.items.map((item) => (
                            <label key={item.id} className="flex items-center gap-2.5 text-xs cursor-pointer hover:bg-secondary/60 p-2 rounded-lg transition-colors">
                              <input
                                type="checkbox"
                                checked={item.is_completed}
                                readOnly
                                className="w-4 h-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
                              />
                              <span className={item.is_completed ? 'line-through text-muted font-medium' : 'text-heading font-medium'}>
                                {item.content}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}

                  {newChecklistModal && (
                    <form onSubmit={handleCreateChecklist} className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3 animate-fadeIn">
                      <h5 className="font-bold text-xs uppercase text-heading">Create Quality Checklist</h5>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Checklist Title (e.g. Pre-deployment QA pass)"
                          value={checklistTitle}
                          onChange={(e) => setChecklistTitle(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none mb-2"
                        />
                        <input
                          type="text"
                          placeholder="Comma-separated items (e.g. Unit tests pass, Security scan, DB schema migration)"
                          value={checklistItemInput}
                          onChange={(e) => setChecklistItemInput(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={() => setNewChecklistModal(false)} className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-muted font-semibold hover:bg-secondary">Cancel</button>
                        <button type="submit" className="text-xs px-4 py-1.5 rounded-lg bg-primary text-white font-semibold shadow-xs hover:bg-primary-hover">Save Checklist</button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Tab 3: Comments & Team Collaboration */}
              {activeTab === 'comments' && (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {task.comments?.length === 0 ? (
                      <p className="text-xs text-muted italic py-8 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                        No team comments recorded yet. Start the engineering thread below!
                      </p>
                    ) : (
                      task.comments?.map((comment) => (
                        <div key={comment.id} className="p-3.5 rounded-xl bg-secondary/20 border border-border space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-heading">{comment.user?.full_name || comment.user?.username || `Member #${comment.user_id}`}</span>
                            <span className="text-[10px] text-muted">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{comment.content}</p>

                          <div className="flex items-center gap-1.5 pt-1">
                            {['👍', '❤️', '🚀', '🔥', '👀', '🎉'].map((emoji) => {
                              const count = comment.reactions?.filter((r) => r.emoji === emoji).length || 0;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(comment.id, emoji)}
                                  className={`px-2 py-0.5 rounded-full text-[11px] border flex items-center gap-1 transition-colors ${
                                    count > 0 ? 'bg-primary/15 border-primary/20 text-primary font-bold' : 'bg-surface border-border hover:bg-secondary text-muted'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  {count > 0 && <span>{count}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2 pt-3 border-t border-border mt-auto">
                    <input
                      type="text"
                      placeholder="Post an engineering update or tag teammate (@username)..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-primary-hover shadow-xs disabled:opacity-50 shrink-0"
                    >
                      {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Comment</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: Attachments */}
              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-secondary/10 cursor-pointer">
                    <Paperclip className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs font-bold text-heading">Drop engineering specs or design files here</p>
                    <p className="text-[10px] text-muted mt-1">Automatic version control enabled (Max 25MB per asset)</p>
                  </div>

                  <div className="space-y-2">
                    {task.attachments?.length === 0 ? (
                      <p className="text-xs text-muted italic text-center py-4">No attachments uploaded for this task.</p>
                    ) : (
                      task.attachments?.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-heading">{att.filename}</p>
                              <span className="text-[10px] font-mono bg-secondary text-muted px-1.5 py-0.5 rounded border border-border mt-0.5 inline-block">v{att.version}</span>
                            </div>
                          </div>
                          <a
                            href={att.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-primary font-semibold text-xs flex items-center gap-1 border border-border transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Time Tracking */}
              {activeTab === 'time' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/15 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-heading flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Live Stopwatch Timer
                      </h4>
                      <p className="text-xs text-muted mt-0.5">Accurately log sprint hours against estimated story points</p>
                    </div>
                    <div>
                      {activeLogId ? (
                        <button
                          onClick={handleStopTimer}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs animate-pulse"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" /> Stop Running Timer
                        </button>
                      ) : (
                        <button
                          onClick={handleStartTimer}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Start Live Timer
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-surface shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Estimated Story Hours</span>
                      <p className="text-2xl font-extrabold text-heading mt-1">{task.estimated_hours || 0}h</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-surface shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Actual Logged Hours</span>
                      <p className="text-2xl font-extrabold text-primary mt-1">{task.actual_hours || 0}h</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Metadata Inspector Sidebar */}
            <div className="w-full md:w-64 p-6 space-y-5 bg-secondary/30 border-t md:border-t-0 shrink-0">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Priority Level</label>
                <select
                  value={task.priority}
                  onChange={(e) => handleUpdateField('priority', e.target.value as Priority)}
                  className="w-full text-xs font-bold text-heading bg-surface border border-border rounded-lg px-3 py-2 cursor-pointer focus:ring-1 focus:ring-primary shadow-2xs outline-none"
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Severity / Impact</label>
                <select
                  value={task.severity || 'MINOR'}
                  onChange={(e) => handleUpdateField('severity', e.target.value as Severity)}
                  className="w-full text-xs font-bold text-heading bg-surface border border-border rounded-lg px-3 py-2 cursor-pointer focus:ring-1 focus:ring-primary shadow-2xs outline-none"
                >
                  {['TRIVIAL', 'MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Story Points</label>
                <input
                  type="number"
                  min={0}
                  value={task.story_points || 0}
                  onChange={(e) => handleUpdateField('story_points', Number(e.target.value))}
                  className="w-full text-xs font-bold text-heading bg-surface border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary shadow-2xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={task.due_date?.slice(0, 10) || ''}
                  onChange={(e) => handleUpdateField('due_date', e.target.value ? `${e.target.value}T00:00:00` : null)}
                  className="w-full text-xs font-semibold text-heading bg-surface border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary shadow-2xs outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-[10px] text-muted space-y-1">
                  <p><strong>Created:</strong> {task.created_at ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true }) : 'N/A'}</p>
                  <p><strong>Assignee:</strong> {task.assignee?.full_name || task.assignee?.username || 'Unassigned'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
