import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckSquare, Folder, MessageSquare, User as UserIcon, X } from 'lucide-react';
import api from '@/services/api';

interface SearchResult {
  tasks: { id: number; title: string; priority: string; status: string }[];
  projects: { id: number; name: string; key: string }[];
  comments: { id: number; task_id: number; content_snippet: string }[];
  users: { id: number; username: string; full_name?: string; avatar_url?: string }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: number) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, onSelectTask }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/search/query', { params: { q: query } });
        setResults(res.data.results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-foreground">
        <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-secondary/30">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, projects, comments, or teammates across enterprise..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-base placeholder:text-muted-foreground font-medium"
          />
          {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-6">
          {!results && !loading && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Type at least 2 characters to search across all workspaces, tasks, and files.
            </div>
          )}

          {results && (
            <>
              {results.tasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-primary" /> Tasks ({results.tasks.length})
                  </h4>
                  <div className="space-y-1">
                    {results.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => { onSelectTask(t.id); onClose(); }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/60 cursor-pointer transition-colors border border-transparent hover:border-border"
                      >
                        <span className="font-medium text-sm text-foreground">{t.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            {t.priority}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.projects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-amber-500" /> Projects ({results.projects.length})
                  </h4>
                  <div className="space-y-1">
                    {results.projects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/60 transition-colors">
                        <span className="font-medium text-sm">{p.name}</span>
                        <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">{p.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.comments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-500" /> Comments ({results.comments.length})
                  </h4>
                  <div className="space-y-1">
                    {results.comments.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => { onSelectTask(c.task_id); onClose(); }}
                        className="p-2 rounded-lg hover:bg-secondary/60 cursor-pointer text-xs text-muted-foreground transition-colors"
                      >
                        "{c.content_snippet}..." <span className="text-primary font-medium">(Task #{c.task_id})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.users.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-purple-500" /> Users ({results.users.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {results.users.map((u) => (
                      <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 border border-border">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-foreground">{u.full_name || u.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.tasks.length === 0 && results.projects.length === 0 && results.comments.length === 0 && results.users.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No matching results found across the enterprise platform.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
