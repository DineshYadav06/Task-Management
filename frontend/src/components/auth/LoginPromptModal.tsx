import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, X, Sparkles } from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose, actionName = 'create tasks or projects' }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fadeIn p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/20 via-purple-500/10 to-transparent p-6 border-b border-border relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md mb-3.5">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-heading tracking-tight flex items-center gap-2">
            Enterprise Login Required
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            To <span className="font-semibold text-foreground">{actionName}</span> and sync data across your enterprise team on MongoDB Atlas, please sign in or create an account.
          </p>
        </div>

        {/* Benefits list */}
        <div className="p-6 space-y-3 bg-secondary/20">
          <div className="flex items-start gap-2.5 text-xs text-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>Save tasks, subtasks, sprints, and milestones permanently to cloud DB.</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>Collaborate in real-time with team members and receive instant updates.</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>Unlock AI Assistant summaries and smart sprint priority recommendations.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-border flex flex-col sm:flex-row gap-3 bg-surface justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-xs font-semibold text-muted hover:text-heading transition-colors"
          >
            Explore as Guest
          </button>
          <button
            onClick={() => { onClose(); navigate('/login'); }}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" /> Log In
          </button>
          <button
            onClick={() => { onClose(); navigate('/register'); }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Register Free
          </button>
        </div>
      </div>
    </div>
  );
};
