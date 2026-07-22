import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Clock, Play, Square, Paperclip, MessageSquare, CheckSquare,
  AlertCircle, ThumbsUp, Heart, Rocket, Flame, Eye, Plus, Send, Loader2, Download
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
  const [manualHours, setManualHours] = useState('');
  const [manualDesc, setManualDesc] = useState('');

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
      setAiSummary('Failed to generate AI summary.');
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
      alert(err.response?.data?.detail || 'Timer error');
    }
  };

  const handleStopTimer = async () => {
    if (!activeLogId) return;
    try {
      await timeApi.stopTimer(activeLogId);
      setActiveLogId(null);
      await fetchTaskDetails();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Timer error');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-foreground">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary/20 text-primary border border-primary/30">
              TASK-{taskId}
            </span>
            <select
              value={task?.status || 'TODO'}
              onChange={(e) => handleUpdateField('status', e.target.value as TaskStatus)}
              className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-secondary border border-border cursor-pointer focus:outline-none"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {loadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              AI Summarize
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading || !task ? (
          <div className="flex-1 flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Main Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-border">
              {/* Title input */}
              <input
                type="text"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                onBlur={(e) => handleUpdateField('title', e.target.value)}
                className="w-full text-xl font-extrabold bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/40 rounded px-1 -ml-1"
              />

              {/* AI Summary Banner */}
              {aiSummary && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-300">
                    <Sparkles className="w-4 h-4" /> AI Executive Brief
                  </div>
                  <pre className="font-sans whitespace-pre-wrap leading-relaxed">{aiSummary}</pre>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 border-b border-border text-xs font-semibold">
                {[
                  { id: 'details', label: 'Overview' },
                  { id: 'checklists', label: `Checklists (${task.checklists?.length || 0})` },
                  { id: 'comments', label: `Comments (${task.comments?.length || 0})` },
                  { id: 'attachments', label: `Attachments (${task.attachments?.length || 0})` },
                  { id: 'time', label: 'Time Tracking' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Details / Description */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Specification & Notes
                    </label>
                    <button
                      onClick={handleAiGenerateDescription}
                      disabled={generatingDesc}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-50"
                    >
                      {generatingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Expand with AI
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    placeholder="Add detailed markdown specification, technical constraints, or acceptance criteria..."
                    value={task.description || ''}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                    onBlur={(e) => handleUpdateField('description', e.target.value)}
                    className="w-full bg-secondary/40 border border-border rounded-xl p-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Tab 2: Checklists */}
              {activeTab === 'checklists' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Acceptance Checklists</h4>
                    <button
                      onClick={() => setNewChecklistModal(true)}
                      className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Checklist
                    </button>
                  </div>

                  {task.checklists?.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-6 text-center">No checklists created yet.</p>
                  ) : (
                    task.checklists.map((cl) => (
                      <div key={cl.id} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-2">
                        <h5 className="font-bold text-xs uppercase tracking-wide text-primary">{cl.title}</h5>
                        <div className="space-y-1.5 pt-1">
                          {cl.items.map((item) => (
                            <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/40 p-1.5 rounded">
                              <input
                                type="checkbox"
                                checked={item.is_completed}
                                readOnly
                                className="w-4 h-4 rounded border-border text-primary focus:ring-0"
                              />
                              <span className={item.is_completed ? 'line-through text-muted-foreground' : ''}>{item.content}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}

                  {newChecklistModal && (
                    <form onSubmit={handleCreateChecklist} className="p-4 rounded-xl border border-border bg-secondary/40 space-y-3">
                      <h5 className="font-bold text-xs uppercase">New Checklist</h5>
                      <input
                        type="text"
                        required
                        placeholder="Checklist Title (e.g. QA Verification)"
                        value={checklistTitle}
                        onChange={(e) => setChecklistTitle(e.target.value)}
                        className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Comma-separated items (e.g. Unit tests, UI pass, API load test)"
                        value={checklistItemInput}
                        onChange={(e) => setChecklistItemInput(e.target.value)}
                        className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setNewChecklistModal(false)} className="text-xs px-3 py-1 rounded bg-secondary">Cancel</button>
                        <button type="submit" className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground font-semibold">Save</button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Tab 3: Comments & Reactions */}
              {activeTab === 'comments' && (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {task.comments?.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-6 text-center">No comments yet. Start the conversation below!</p>
                    ) : (
                      task.comments?.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-xl bg-secondary/30 border border-border space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-primary">{comment.user?.full_name || comment.user?.username || `User #${comment.user_id}`}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">{comment.content}</p>

                          <div className="flex items-center gap-1.5 pt-1">
                            {['👍', '❤️', '🚀', '🔥', '👀', '🎉'].map((emoji) => {
                              const count = comment.reactions?.filter((r) => r.emoji === emoji).length || 0;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(comment.id, emoji)}
                                  className={`px-2 py-0.5 rounded-full text-[11px] border flex items-center gap-1 transition-colors ${
                                    count > 0 ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-secondary border-border hover:bg-secondary/80'
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

                  <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-border mt-auto">
                    <input
                      type="text"
                      placeholder="Write a comment or update (use @username to mention)..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-secondary/40 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
                    >
                      {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: Attachments */}
              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <Paperclip className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-semibold">Drop files here or click to upload</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Supports versioning automatically (Max 25MB)</p>
                  </div>

                  <div className="space-y-2">
                    {task.attachments?.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs font-bold">{att.filename}</p>
                            <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded">v{att.version}</span>
                          </div>
                        </div>
                        <a
                          href={att.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded hover:bg-secondary text-primary flex items-center gap-1 text-xs font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Time Tracking */}
              {activeTab === 'time' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Stopwatch Timer
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Track live work hours accurately against this task</p>
                    </div>
                    <div>
                      {activeLogId ? (
                        <button
                          onClick={handleStopTimer}
                          className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" /> Stop Running Timer
                        </button>
                      ) : (
                        <button
                          onClick={handleStartTimer}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Start Timer
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-border bg-secondary/20">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Estimated Hours</span>
                      <p className="text-xl font-extrabold mt-1">{task.estimated_hours || 0}h</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border bg-secondary/20">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Actual Logged</span>
                      <p className="text-xl font-extrabold mt-1 text-primary">{task.actual_hours || 0}h</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Metadata Sidebar */}
            <div className="w-full md:w-64 p-6 space-y-5 bg-secondary/10">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Priority</label>
                <select
                  value={task.priority}
                  onChange={(e) => handleUpdateField('priority', e.target.value as Priority)}
                  className="w-full mt-1 text-xs font-bold bg-secondary border border-border rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none"
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Severity</label>
                <select
                  value={task.severity || 'MINOR'}
                  onChange={(e) => handleUpdateField('severity', e.target.value as Severity)}
                  className="w-full mt-1 text-xs font-bold bg-secondary border border-border rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none"
                >
                  {['TRIVIAL', 'MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Story Points</label>
                <input
                  type="number"
                  value={task.story_points || 0}
                  onChange={(e) => handleUpdateField('story_points', Number(e.target.value))}
                  className="w-full mt-1 text-xs font-bold bg-secondary border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Due Date</label>
                <input
                  type="date"
                  value={task.due_date?.slice(0, 10) || ''}
                  onChange={(e) => handleUpdateField('due_date', e.target.value ? `${e.target.value}T00:00:00` : null)}
                  className="w-full mt-1 text-xs font-semibold bg-secondary border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
