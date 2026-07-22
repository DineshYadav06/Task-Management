import React from 'react';
import { Layers, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      {/* Left Column: Rich Branding Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-r border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 text-primary-foreground font-extrabold text-xl">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">TaskMaster Enterprise</span>
        </div>

        <div className="space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen SaaS Architecture
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            The All-in-One Command Center for High-Velocity Teams
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Integrate Jira workflows, ClickUp flexibility, Asana timelines, and Monday analytics into a single ultra-responsive workspace with AI Copilot automation.
          </p>

          <div className="space-y-3 pt-4">
            {[
              'Real-time drag & drop Kanban board with custom WIP limits',
              'AI Copilot for executive summaries & priority suggestions',
              'FullCalendar timelines, sprint burndown charts & timesheet logs',
              'Enterprise-grade RBAC, custom domains & WebSocket notifications'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-8 border-t border-slate-800">
          <span>© 2026 TaskMaster Enterprise SaaS. FAANG-Level Standards.</span>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> SOC2 & ISO27001 Ready
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </div>
  );
};
