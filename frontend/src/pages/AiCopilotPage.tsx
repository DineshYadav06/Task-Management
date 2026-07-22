import React, { useState } from 'react';
import { aiApi } from '@/services/api';
import { Sparkles, Bot, CheckSquare, Loader2, Copy, Check, ArrowRight } from 'lucide-react';

export const AiCopilotPage: React.FC = () => {
  const [draftNotes, setDraftNotes] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [loadingStory, setLoadingStory] = useState(false);
  const [copied, setCopied] = useState(false);

  const [titleCheck, setTitleCheck] = useState('');
  const [prioritySuggestion, setPrioritySuggestion] = useState<{ suggested_priority?: string; suggested_severity?: string; rationale?: string } | null>(null);
  const [loadingPriority, setLoadingPriority] = useState(false);

  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftNotes.trim()) return;
    setLoadingStory(true);
    try {
      const res = await aiApi.generateDescription(draftNotes);
      if (res && res.generated_description) {
        setGeneratedStory(res.generated_description);
      }
    } finally {
      setLoadingStory(false);
    }
  };

  const handleSuggestPriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleCheck.trim()) return;
    setLoadingPriority(true);
    try {
      const res = await aiApi.suggestPriority(titleCheck, draftNotes || 'No description provided');
      setPrioritySuggestion(res);
    } finally {
      setLoadingPriority(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedStory);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-950 to-slate-900 border border-purple-500/30 text-white space-y-3 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Gemini AI Studio Engine
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">AI Copilot & Smart Workflow Generator</h2>
        <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
          Transform unstructured meeting notes, customer feedback, and brain dumps into production-ready Jira/ClickUp user stories with automated acceptance criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story Generator Card */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Bot className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-base">User Story Specification Expander</h3>
              <p className="text-xs text-muted-foreground">Paste rough bullet points or draft requirements</p>
            </div>
          </div>

          <form onSubmit={handleGenerateStory} className="space-y-4 flex-1 flex flex-col">
            <textarea
              rows={6}
              required
              placeholder="e.g. Need OAuth2 Google login button on signin page. Must save avatar, verify JWT token, and redirect to dashboard with error handling..."
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              className="w-full bg-secondary/30 border border-border rounded-xl p-3.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1"
            />
            <button
              type="submit"
              disabled={loadingStory}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingStory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              <span>Generate Structured User Story</span>
            </button>
          </form>
        </div>

        {/* Output Preview */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base">Generated Specification Preview</h3>
            </div>
            {generatedStory && (
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Markdown'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-secondary/20 border border-border rounded-xl p-4 overflow-y-auto max-h-[400px] font-sans text-xs leading-relaxed whitespace-pre-wrap">
            {generatedStory ? (
              generatedStory
            ) : (
              <span className="text-muted-foreground/60 italic flex items-center justify-center h-full">
                AI generated specification markdown will appear right here...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Priority Suggestion Tool */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-base">AI Priority & Severity Recommendation Engine</h3>
            <p className="text-xs text-muted-foreground">Analyze task titles and descriptions using heuristics/LLM to determine exact priority</p>
          </div>
        </div>

        <form onSubmit={handleSuggestPriority} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter task title to evaluate (e.g. Production Database Deadlock on Payment Checkout)..."
            value={titleCheck}
            onChange={(e) => setTitleCheck(e.target.value)}
            className="flex-1 bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loadingPriority}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loadingPriority ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>Analyze Priority</span>
          </button>
        </form>

        {prioritySuggestion && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Analysis Result</span>
              <p className="text-sm font-semibold">{prioritySuggestion.rationale}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold px-3 py-1 rounded bg-red-500 text-white shadow-xs">
                {prioritySuggestion.suggested_priority || 'HIGH'}
              </span>
              {prioritySuggestion.suggested_severity && (
                <span className="text-xs font-bold px-3 py-1 rounded bg-secondary text-foreground">
                  {prioritySuggestion.suggested_severity}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
