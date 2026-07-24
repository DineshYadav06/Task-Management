import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, CheckCircle2, ShieldCheck, Building2, Lock } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground font-sans">
      {/* Left Column: Clean Enterprise Branding */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-slate-900 text-white border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight block leading-none">TaskMaster</span>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Enterprise Cloud</span>
            </div>
          </div>

          <div className="space-y-4 max-w-md mt-12">
            <h1 className="text-3xl font-extrabold tracking-tight leading-snug">
              Professional command center for agile enterprise engineering teams.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Consolidate sprint planning, real-time Kanban tracking, structured table grids, and AI bottleneck detection into a single high-velocity platform.
            </p>
          </div>

          <div className="space-y-3 pt-10">
            {[
              'Jira & Linear comparable agile workflows and sprints',
              'Sub-second real-time WebSocket state synchronization',
              'Role-Based Access Control (RBAC) with audit histories',
              'AI Copilot for instant task summarization and triage'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-8 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>SOC2 Type II & ISO27001 Certified Architecture</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Lock className="w-3.5 h-3.5" /> E2E Encrypted
          </div>
        </div>
      </div>

      {/* Right Column: Clean White Authentication Surface */}
      <div className="lg:col-span-7 flex flex-col p-6 sm:p-12 bg-background relative">
        <div className="absolute top-6 right-6 sm:top-12 sm:right-12">
          <Link to="/" className="text-xs font-semibold text-muted hover:text-heading flex items-center gap-1.5 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-sm p-8 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
