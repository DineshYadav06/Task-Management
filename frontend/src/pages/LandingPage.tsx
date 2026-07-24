import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronRight, Play, Shield, Zap, Layout, Github, CheckSquare, Layers, FolderKanban, GitMerge, Linkedin, Twitter } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Footer } from '@/components/layout/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <TopNavbar />

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-xs font-semibold text-primary mb-8 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          TaskMaster V2.0 is now live
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-heading tracking-tight max-w-4xl leading-[1.1] mb-6">
          The new standard for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-amber-500">modern product teams</span>
        </h1>

        <p className="text-lg md:text-xl text-muted font-medium max-w-2xl mb-10 leading-relaxed">
          Unify your workflow, accelerate delivery, and bring your team's ideas to life with our enterprise-grade task management platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-base font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            Start building for free <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/contact"
            className="px-8 py-4 rounded-xl bg-surface border border-border hover:bg-secondary text-heading text-base font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            Book a demo
          </Link>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-sm font-medium text-muted flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> No credit card required
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 14-day free trial on Pro
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> SOC2 Type II Certified
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};
