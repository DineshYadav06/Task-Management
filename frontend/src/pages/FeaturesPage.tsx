import React from 'react';
import { Layers, ArrowRight, Zap, Shield, GitMerge, LayoutDashboard, CheckSquare, Users, FolderKanban, MessageSquare, Clock, BarChart, Settings, Key, Lock, Target, Map, Video, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Footer } from '@/components/layout/Footer';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <TopNavbar />

      <main className="py-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-heading tracking-tight">Everything you need to ship faster.</h1>
          <p className="text-lg text-muted font-medium">TaskMaster provides a complete toolkit for modern engineering and product teams to plan, build, and deploy with confidence.</p>
        </div>

        <div className="relative w-full h-64 md:h-[400px] rounded-3xl overflow-hidden border border-border shadow-2xl mb-16">
          <img 
            src="/images/features_hero.png" 
            alt="TaskMaster Features" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-heading mb-4">Kanban & Sprint Planning</h3>
            <p className="text-muted leading-relaxed">Visualize your work with highly customizable Kanban boards. Plan sprints, track velocity, and manage backlog with our powerful agile tools.</p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
              <GitMerge className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-heading mb-4">Deep Git Integration</h3>
            <p className="text-muted leading-relaxed">Connect your repositories to automatically link commits and PRs to tasks. Close tasks automatically when code is merged.</p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-heading mb-4">Real-time Sync</h3>
            <p className="text-muted leading-relaxed">Experience sub-second updates across all your devices. When a teammate moves a card, you see it instantly without refreshing.</p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-heading mb-4">Enterprise Security</h3>
            <p className="text-muted leading-relaxed">SOC2 Type II certified infrastructure with Role-Based Access Control (RBAC), SSO, and detailed audit logs for enterprise compliance.</p>
          </div>
        </div>

        {/* Detailed Features Sections */}
        <div className="space-y-24 pt-12 border-t border-border/50">
          
          <section id="tasks">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-heading">Task Management</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Task Creation', icon: <CheckSquare/>, desc: 'Quickly create tasks with rich text descriptions and attachments.' },
                { name: 'Smart Assignment', icon: <Users/>, desc: 'Auto-assign tasks based on team workload and availability.' },
                { name: 'Task Priorities', icon: <Target/>, desc: 'Set urgent, high, medium, or low priority levels.' },
                { name: 'Due Dates', icon: <Clock/>, desc: 'Never miss a deadline with automated reminders.' },
                { name: 'Recurring Tasks', icon: <Zap/>, desc: 'Automate daily, weekly, or monthly repeatable workflows.' },
                { name: 'Subtasks & Checklists', icon: <LayoutDashboard/>, desc: 'Break down complex issues into manageable steps.' }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-xl bg-secondary/30 border border-border">
                  <div className="text-primary mb-4">{f.icon}</div>
                  <h4 className="font-bold text-heading mb-2">{f.name}</h4>
                  <p className="text-sm text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="projects">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-heading">Project Management</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Project Dashboard', icon: <LayoutDashboard/>, desc: 'Get a bird\'s-eye view of your project health and velocity.' },
                { name: 'Project Timeline', icon: <Map/>, desc: 'Visualize dependencies and long-term goals.' },
                { name: 'Milestones', icon: <Target/>, desc: 'Mark significant phases in your project lifecycle.' },
                { name: 'Sprint Planning', icon: <Zap/>, desc: 'Organize backlog and sprint cycles effortlessly.' },
                { name: 'Kanban & Gantt', icon: <FolderKanban/>, desc: 'Toggle between agile boards and traditional timelines.' },
                { name: 'Roadmap', icon: <Map/>, desc: 'Share your product vision with stakeholders.' }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-xl bg-secondary/30 border border-border">
                  <div className="text-primary mb-4">{f.icon}</div>
                  <h4 className="font-bold text-heading mb-2">{f.name}</h4>
                  <p className="text-sm text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="collaboration">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-heading">Team Collaboration & Productivity</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Team Workspace', icon: <Users/>, desc: 'Dedicated hubs for your engineering and marketing squads.' },
                { name: 'Real-time Chat', icon: <MessageSquare/>, desc: 'Contextual chat embedded directly within tasks.' },
                { name: 'Video Meetings', icon: <Video/>, desc: 'Launch a quick huddle without leaving the app.' },
                { name: 'Time Tracking', icon: <Clock/>, desc: 'Log hours directly on tasks for client billing.' },
                { name: 'Reports & Analytics', icon: <BarChart/>, desc: 'Generate beautiful charts to visualize team output.' },
                { name: 'AI Assistant', icon: <Sparkles/>, desc: 'Let AI write task summaries and generate subtasks.' }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-xl bg-secondary/30 border border-border">
                  <div className="text-primary mb-4">{f.icon}</div>
                  <h4 className="font-bold text-heading mb-2">{f.name}</h4>
                  <p className="text-sm text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="security">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-heading">Enterprise Security</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Role Based Access', icon: <Key/>, desc: 'Granular permissions for admins, managers, and viewers.' },
                { name: 'JWT Authentication', icon: <Lock/>, desc: 'Secure token-based auth for robust session management.' },
                { name: 'Audit Logs', icon: <Layers/>, desc: 'Track every action taken by users across the workspace.' },
                { name: 'Two-Factor Auth', icon: <ShieldCheck/>, desc: 'Mandatory 2FA enforcement for all enterprise seats.' },
                { name: 'Data Backup', icon: <Settings/>, desc: 'Automated nightly backups with 99.99% uptime SLA.' },
                { name: 'API Access', icon: <GitMerge/>, desc: 'Connect internal tools with our comprehensive REST API.' }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-xl bg-secondary/30 border border-border">
                  <div className="text-primary mb-4">{f.icon}</div>
                  <h4 className="font-bold text-heading mb-2">{f.name}</h4>
                  <p className="text-sm text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};
