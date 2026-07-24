import React from 'react';
import { Layers, Users, Zap, Building2, Briefcase, Calculator, Map, GraduationCap, Link2, Code, Megaphone, CheckCircle2 } from 'lucide-react';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

export const SolutionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <TopNavbar />

      <main className="py-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-24">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-xs font-semibold text-primary mb-2">
              <SparkleIcon />
              Enterprise Solutions
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-heading tracking-tight">Built for every team and industry.</h1>
            <p className="text-lg text-muted font-medium max-w-xl">
              Whether you're a nimble startup or a global enterprise, TaskMaster adapts to your workflow. Discover how we solve problems for your specific use case.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/register" className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md">Get Started Free</Link>
              <Link to="/contact" className="px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-heading font-bold border border-border transition-colors">Contact Sales</Link>
            </div>
          </div>
          <div className="flex-1 relative w-full h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
            <img 
              src="/images/solutions_hero.png" 
              alt="Solutions Hero" 
              className="relative w-full h-full object-cover rounded-3xl border border-border/50 shadow-2xl z-10"
            />
          </div>
        </div>

        {/* By Team */}
        <section className="space-y-12 pt-12 border-t border-border/50" id="teams">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-heading">Solutions by Team</h2>
            <p className="text-muted max-w-2xl mx-auto">Empower your department with purpose-built workflows.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: 'software', name: 'Software Development', icon: <Code/>, desc: 'Ship code faster with agile boards, Git integrations, and automated sprint planning.' },
              { id: 'startups', name: 'Startup Teams', icon: <Zap/>, desc: 'Stay lean and move fast. Scale your operations without changing tools.' },
              { id: 'enterprise', name: 'Enterprise Companies', icon: <Building2/>, desc: 'Advanced security, RBAC, and dedicated support for large organizations.' },
              { id: 'marketing', name: 'Marketing Teams', icon: <Megaphone/>, desc: 'Plan campaigns, manage creative assets, and track deliverables in one place.' },
              { id: 'hr', name: 'HR Teams', icon: <Users/>, desc: 'Streamline onboarding, track applicant pipelines, and manage employee reviews.' },
              { id: 'sales', name: 'Sales & Finance', icon: <Calculator/>, desc: 'Track deals, forecast revenue, and collaborate on cross-functional initiatives.' }
            ].map(team => (
              <div key={team.id} id={team.id} className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  {team.icon}
                </div>
                <h3 className="text-xl font-bold text-heading mb-3">{team.name}</h3>
                <p className="text-muted leading-relaxed mb-6">{team.desc}</p>
                <Link to="/register" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">Learn more <ArrowRightIcon /></Link>
              </div>
            ))}
          </div>
        </section>

        {/* By Industry */}
        <section className="space-y-12 pt-12 border-t border-border/50" id="industry">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-heading">Solutions by Industry</h2>
            <p className="text-muted max-w-2xl mx-auto">Customized approaches for your sector's unique challenges.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'it', name: 'Information Technology', icon: <Layers/>, desc: 'Manage IT tickets, infrastructure projects, and support queues efficiently.' },
              { id: 'manufacturing', name: 'Manufacturing', icon: <SettingsIcon/>, desc: 'Track supply chains, production schedules, and quality assurance processes.' },
              { id: 'banking', name: 'Banking & Finance', icon: <Briefcase/>, desc: 'Securely manage compliance projects, audits, and financial reporting.' },
              { id: 'construction', name: 'Construction', icon: <Map/>, desc: 'Coordinate contractors, track site progress, and manage budgets in real-time.' },
              { id: 'logistics', name: 'Logistics', icon: <Link2/>, desc: 'Optimize routes, track shipments, and coordinate warehouse operations.' },
              { id: 'agencies', name: 'Agencies', icon: <GraduationCap/>, desc: 'Manage client projects, track billable hours, and collaborate seamlessly.' }
            ].map(industry => (
              <div key={industry.id} id={industry.id} className="p-8 rounded-2xl bg-surface border border-border flex flex-col items-center text-center hover:bg-secondary/50 transition-colors">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                  {industry.icon}
                </div>
                <h3 className="text-lg font-bold text-heading mb-2">{industry.name}</h3>
                <p className="text-sm text-muted mb-4">{industry.desc}</p>
                <div className="flex gap-2 justify-center flex-wrap mt-auto">
                  <span className="px-2 py-1 bg-background rounded text-xs font-semibold text-muted-foreground border border-border"><CheckCircle2 className="w-3 h-3 inline mr-1" />Custom Workflows</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

function SparkleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>;
}

function ArrowRightIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}

function SettingsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
