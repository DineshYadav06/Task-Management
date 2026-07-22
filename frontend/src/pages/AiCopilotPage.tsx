import React, { useState } from 'react';
import { aiApi } from '@/services/api';
import { Sparkles, Bot, CheckSquare, Loader2, Copy, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

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
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-8 rounded-2xl bg-surface border border-purple-200 shadow-2xs space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gemini AI Studio Engine
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-heading">AI Copilot & Smart Workflow Generator</h1>
        <p className="text-muted text-xs max-w-3xl leading-relaxed">
          Transform unstructured meeting notes, customer feedback, and quick brain dumps into structured Jira/Linear engineering specifications with automated acceptance criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story Generator Card */}
        <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Bot className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-bold text-base text-heading">User Story Specification Expander</h3>
              <p className="text-xs text-muted">Paste rough bullet points or draft requirements</p>
            </div>
          </div>

          <form onSubmit={handleGenerateStory} className="space-y-4 flex-1 flex flex-col">
            <textarea
              rows={8}
              required
              placeholder="e.g. Need OAuth2 Google login button on signin page. Must save avatar, verify JWT token, and redirect to dashboard with error handling..."
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs font-sans text-foreground focus:outline-none focus:ring-2 focus:ring-purple-600 flex-1 leading-relaxed"
            />
            <button
              type="submit"
              disabled={loadingStory}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingStory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              <span>Generate Structured User Story</span>
            </button>
          </form>
        </div>

        {/* Output Preview */}
        <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-base text-heading">Generated Specification Preview</h3>
                <p className="text-xs text-muted">Ready for copy/paste into task specification</p>
              </div>
            </div>
            {generatedStory && (
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-border text-heading"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Markdown'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-secondary/30 border border-border rounded-xl p-4 overflow-y-auto max-h-[420px] font-sans text-xs leading-relaxed whitespace-pre-wrap text-foreground">
            {generatedStory ? (
              generatedStory
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-2">
                <Zap className="w-6 h-6 text-muted/40" />
                <span className="text-muted/70 italic text-xs">
                  AI generated specification markdown will appear right here...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priority Suggestion Tool */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-bold text-base text-heading">AI Priority & Severity Triage Engine</h3>
            <p className="text-xs text-muted">Evaluate bug or feature descriptions using heuristic NLP to suggest exact priority and impact level</p>
          </div>
        </div>

        <form onSubmit={handleSuggestPriority} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter issue or feature title to evaluate (e.g. Production Database Deadlock on Payment Checkout)..."
            value={titleCheck}
            onChange={(e) => setTitleCheck(e.target.value)}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary text-heading"
          />
          <button
            type="submit"
            disabled={loadingPriority}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 transition-colors"
          >
            {loadingPriority ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>Analyze Priority</span>
          </button>
        </form>

        {prioritySuggestion && (
          <div className="p-4 rounded-xl bg-primary/15 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Triage Recommendation</span>
              <p className="text-xs font-semibold text-heading">{prioritySuggestion.rationale}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold px-3 py-1 rounded border bg-red-500/15 text-red-600 border-red-500/20 shadow-2xs">
                {prioritySuggestion.suggested_priority || 'HIGH'}
              </span>
              {prioritySuggestion.suggested_severity && (
                <span className="text-xs font-bold px-3 py-1 rounded bg-surface border border-border text-heading shadow-2xs">
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
