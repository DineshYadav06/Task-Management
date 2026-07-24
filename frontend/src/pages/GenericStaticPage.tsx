import React from 'react';
import { Layers, Calendar, FileText, ArrowRight, CheckCircle2, Shield, Users, Briefcase, GitPullRequest, Code, MessageSquare, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Footer } from '@/components/layout/Footer';

export const GenericStaticPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  
  const title = path
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <TopNavbar />

      <main className="py-20 px-6 lg:px-12 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-heading tracking-tight capitalize">{title}</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {path === 'blog' && "Insights, updates, and thoughts from the TaskMaster team."}
            {path === 'changelog' && "See what's new and improved in TaskMaster."}
            {path === 'integrations' && "Connect TaskMaster with your favorite tools."}
            {path === 'about' && "Our mission is to help teams build the future, faster."}
            {path === 'careers' && "Join us in building the enterprise work OS."}
            {path === 'resources' && "Everything you need to master our platform."}
            {(path === 'privacy' || path === 'terms' || path === 'security' || path === 'cookies') && "Enterprise-grade trust, transparency, and compliance."}
          </p>
        </div>
        
        <div className="prose prose-invert max-w-none text-muted space-y-6">
          
          {/* Docs */}
          {path === 'docs' && (
            <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
              <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8 border border-border">
                <img src="/images/docs_hero.png" alt="Documentation Hero" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              </div>
              <section className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-surface border border-border rounded-xl">
                  <h2 className="text-xl font-bold text-heading mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Getting Started</h2>
                  <p className="text-sm mb-4">Set up your enterprise environment in minutes.</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/login" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4"/> Authentication</Link></li>
                    <li><Link to="/register" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4"/> Creating Workspaces</Link></li>
                  </ul>
                </div>
                <div className="p-6 bg-surface border border-border rounded-xl" id="api">
                  <h2 className="text-xl font-bold text-heading mb-3 flex items-center gap-2"><Code className="w-5 h-5 text-blue-500" /> REST API</h2>
                  <p className="text-sm mb-4">Integrate TaskMaster with your existing stack.</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/docs#api" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4"/> API Reference</Link></li>
                    <li><Link to="/integrations" className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4"/> Webhooks</Link></li>
                  </ul>
                </div>
              </section>
            </div>
          )}

          {/* Resources */}
          {path === 'resources' && (
            <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
              <section className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-surface border border-border rounded-xl" id="tutorials">
                  <h2 className="text-xl font-bold text-heading mb-3">Tutorials</h2>
                  <p className="text-sm mb-4">Step-by-step guides for mastering TaskMaster.</p>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary rounded flex items-center gap-3"><FileText className="w-5 h-5 text-primary"/> <span className="font-semibold text-heading text-sm">Advanced Kanban Workflows</span></div>
                    <div className="p-3 bg-secondary rounded flex items-center gap-3"><FileText className="w-5 h-5 text-primary"/> <span className="font-semibold text-heading text-sm">Setting up RBAC</span></div>
                  </div>
                </div>
                <div className="p-6 bg-surface border border-border rounded-xl" id="guides">
                  <h2 className="text-xl font-bold text-heading mb-3">Video Library</h2>
                  <p className="text-sm mb-4">Watch and learn at your own pace.</p>
                  <div className="aspect-video bg-secondary rounded flex items-center justify-center border border-border">
                    <Zap className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Blog */}
          {path === 'blog' && (
            <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
              <div className="relative w-full h-48 md:h-[400px] rounded-3xl overflow-hidden mb-12 border border-border">
                <img src="/images/blog_hero.png" alt="Blog Hero" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 md:p-12">
                  <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/20 mb-4 inline-block">Featured</span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">The Future of Asynchronous Work</h2>
                  <p className="text-lg text-white/80 max-w-2xl">How top enterprises are moving away from meetings and embracing async collaboration.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: 'TaskMaster v2.0 is here', date: 'Oct 12, 2026', tag: 'Product' },
                  { title: 'Scaling engineering teams', date: 'Oct 05, 2026', tag: 'Engineering' },
                  { title: 'AI in project management', date: 'Sep 28, 2026', tag: 'AI' }
                ].map((post, i) => (
                  <div key={i} className="p-6 bg-surface border border-border rounded-2xl hover:border-primary/50 transition-colors group cursor-pointer">
                    <span className="text-xs font-bold text-primary mb-3 block">{post.tag}</span>
                    <h3 className="text-xl font-bold text-heading mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" /> {post.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {path === 'about' && (
            <div className="space-y-12 animate-fadeIn max-w-4xl mx-auto text-center">
              <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-border">
                <img src="/images/about_hero.png" alt="About Hero" className="w-full h-full object-cover" />
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div><h3 className="text-4xl font-extrabold text-heading">1M+</h3><p className="text-muted font-medium mt-2">Active Users</p></div>
                <div><h3 className="text-4xl font-extrabold text-heading">99.9%</h3><p className="text-muted font-medium mt-2">Uptime</p></div>
                <div><h3 className="text-4xl font-extrabold text-heading">150+</h3><p className="text-muted font-medium mt-2">Countries</p></div>
              </div>
              <div className="p-8 bg-surface border border-border rounded-2xl text-left">
                <h3 className="text-2xl font-bold text-heading mb-4">Our Story</h3>
                <p className="leading-relaxed">TaskMaster started with a simple idea: teams shouldn't have to fight their tools to get work done. Today, we power the workflows of thousands of enterprises worldwide, bringing clarity and speed to complex projects.</p>
              </div>
            </div>
          )}

          {/* Careers */}
          {path === 'careers' && (
            <div className="space-y-12 animate-fadeIn max-w-4xl mx-auto">
              <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden border border-border">
                <img src="/images/careers_hero.png" alt="Careers Hero" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <h2 className="text-3xl font-extrabold text-white">Join the Mission</h2>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-heading">Open Roles</h3>
                {[
                  { role: 'Senior Frontend Engineer', team: 'Engineering', loc: 'Remote (US)' },
                  { role: 'Product Manager, AI', team: 'Product', loc: 'San Francisco, CA' },
                  { role: 'Enterprise Account Executive', team: 'Sales', loc: 'London, UK' },
                  { role: 'Staff Backend Engineer', team: 'Engineering', loc: 'Remote (Global)' }
                ].map((job, i) => (
                  <div key={i} className="p-6 bg-surface border border-border rounded-xl flex items-center justify-between hover:bg-secondary/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-heading text-lg">{job.role}</h4>
                      <div className="flex gap-4 text-sm text-muted mt-2">
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {job.team}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {job.loc}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover text-sm">Apply</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          {path === 'integrations' && (
            <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto text-center">
              <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-12 border border-border">
                <img src="/images/integrations_hero.png" alt="Integrations Hero" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['GitHub', 'Slack', 'Jira', 'Figma', 'GitLab', 'Zoom', 'Google Drive', 'Notion'].map((app, i) => (
                  <div key={i} className="p-6 bg-surface border border-border rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Layers className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="font-bold text-heading">{app}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog */}
          {path === 'changelog' && (
            <div className="space-y-12 animate-fadeIn max-w-3xl mx-auto">
              {[
                { version: 'v2.0.0', date: 'October 15, 2026', title: 'The Enterprise AI Update', features: ['AI Copilot integration in all text fields', 'New advanced RBAC system', 'Performance improvements in Kanban rendering'] },
                { version: 'v1.9.5', date: 'September 28, 2026', title: 'Workflow Automations', features: ['Custom triggers and actions', 'Webhook integrations', 'Bug fixes for mobile Safari'] },
                { version: 'v1.9.0', date: 'September 10, 2026', title: 'Time Tracking Overhaul', features: ['Global timers', 'Timesheet exports to CSV/PDF', 'Billing rate configuration'] }
              ].map((log, i) => (
                <div key={i} className="relative pl-8 border-l border-border/50 pb-8 last:pb-0">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[1.5px] top-2 blur-[2px]"></div>
                  <div className="absolute w-2 h-2 bg-white rounded-full -left-[1px] top-[9px]"></div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-secondary text-heading text-xs font-bold rounded">{log.version}</span>
                    <span className="text-sm text-muted">{log.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-heading mb-4">{log.title}</h3>
                  <ul className="space-y-2">
                    {log.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-muted">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Legal Pages */}
          {(path === 'privacy' || path === 'terms' || path === 'security' || path === 'cookies') && (
            <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto bg-surface p-8 md:p-12 border border-border rounded-3xl">
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border text-emerald-500">
                <Shield className="w-8 h-8" />
                <span className="font-bold text-lg text-heading">Verified Secure</span>
              </div>
              <h2 className="text-2xl font-bold text-heading mb-4">1. Introduction</h2>
              <p className="leading-relaxed mb-6">TaskMaster Enterprise Cloud is committed to protecting your data. This document outlines our policies regarding information collection, processing, and storage.</p>
              
              <h2 className="text-2xl font-bold text-heading mb-4">2. Data Processing</h2>
              <p className="leading-relaxed mb-6">All data is encrypted in transit using TLS 1.3 and at rest using AES-256. We comply with GDPR, CCPA, and maintain SOC2 Type II certification.</p>
              
              <h2 className="text-2xl font-bold text-heading mb-4">3. Your Rights</h2>
              <p className="leading-relaxed mb-6">You have the right to access, modify, or delete your personal data. Enterprise administrators have full control over organizational data retention policies.</p>
              
              <div className="p-6 bg-secondary rounded-xl mt-8">
                <p className="text-sm font-semibold mb-2">Contact our DPO</p>
                <p className="text-xs text-muted">For data requests or legal inquiries, email <span className="text-primary">legal@taskmaster.dev</span>.</p>
              </div>
            </div>
          )}

          {/* Fallback */}
          {(!['docs', 'resources', 'blog', 'about', 'careers', 'integrations', 'changelog', 'privacy', 'terms', 'security', 'cookies'].includes(path)) && (
            <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto text-center">
              <div className="p-12 bg-surface border border-border rounded-3xl">
                <h3 className="text-2xl font-bold text-heading mb-4 text-emerald-500">Page Content in Development</h3>
                <p>We are actively working on finalizing the content for {title}. Please check back in our next release update.</p>
                <div className="mt-8">
                  <Link to="/" className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover">Return Home</Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};
