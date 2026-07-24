import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Footer } from '@/components/layout/Footer';

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <TopNavbar />

      <main className="py-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-heading tracking-tight">Simple, transparent pricing.</h1>
          <p className="text-lg text-muted font-medium">Start for free, upgrade when you need more power and security.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col relative">
            <h3 className="text-xl font-bold text-heading mb-2">Starter</h3>
            <p className="text-muted text-sm mb-6">Perfect for small teams and startups.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-heading">$0</span>
              <span className="text-muted">/mo</span>
            </div>
            <Link to="/register" className="w-full py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-heading font-bold text-center mb-8 border border-border transition-colors">Get Started</Link>
            <div className="space-y-4 flex-1">
              {['Up to 5 users', 'Unlimited tasks', '3 projects', 'Community support'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="p-8 rounded-2xl bg-surface border-2 border-primary relative flex flex-col transform md:-translate-y-4 shadow-xl shadow-primary/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-heading mb-2">Professional</h3>
            <p className="text-muted text-sm mb-6">For growing teams that need more power.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-heading">$12</span>
              <span className="text-muted">/user/mo</span>
            </div>
            <Link to="/register" className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-center mb-8 transition-colors shadow-md shadow-primary/20">Start 14-day Free Trial</Link>
            <div className="space-y-4 flex-1">
              {['Unlimited users', 'Unlimited projects', 'Advanced reporting', 'Custom workflows', 'Priority email support'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col relative">
            <h3 className="text-xl font-bold text-heading mb-2">Enterprise</h3>
            <p className="text-muted text-sm mb-6">Advanced security and support for large orgs.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-heading">Custom</span>
            </div>
            <Link to="/contact" className="w-full py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-heading font-bold text-center mb-8 border border-border transition-colors">Contact Sales</Link>
            <div className="space-y-4 flex-1">
              {['Everything in Pro', 'SAML SSO', 'Advanced audit logs', 'Dedicated success manager', '24/7 phone support'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compare Plans Section */}
        <section className="mt-32 pt-16 border-t border-border" id="compare">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-heading">Compare Plans</h2>
            <p className="text-muted mt-4">Find the perfect set of features for your team's needs.</p>
          </div>
          <div className="overflow-x-auto pb-8">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 border-b border-border/50 font-bold text-heading text-lg w-1/3">Features</th>
                  <th className="p-4 border-b border-border/50 font-bold text-heading text-lg w-2/9">Free</th>
                  <th className="p-4 border-b border-border/50 font-bold text-primary text-lg w-2/9">Professional</th>
                  <th className="p-4 border-b border-border/50 font-bold text-heading text-lg w-2/9">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: 'Users', free: 'Up to 5', pro: 'Unlimited', ent: 'Unlimited' },
                  { feature: 'Projects', free: 'Up to 3', pro: 'Unlimited', ent: 'Unlimited' },
                  { feature: 'Storage', free: '1 GB', pro: '100 GB', ent: 'Unlimited' },
                  { feature: 'Guest Access', free: '-', pro: 'Unlimited', ent: 'Unlimited' },
                  { feature: 'AI Copilot', free: '-', pro: '1,000 requests/mo', ent: 'Unlimited' },
                  { feature: 'Automations', free: '100 runs/mo', pro: '10,000 runs/mo', ent: 'Unlimited runs/mo' },
                  { feature: 'SSO & SAML', free: '-', pro: '-', ent: 'Yes' },
                  { feature: 'Custom Roles', free: '-', pro: '-', ent: 'Yes' },
                  { feature: 'Support', free: 'Community', pro: 'Priority Email', ent: '24/7 Phone & Success Manager' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4 border-b border-border/30 font-medium text-foreground">{row.feature}</td>
                    <td className="p-4 border-b border-border/30 text-muted">{row.free}</td>
                    <td className="p-4 border-b border-border/30 text-foreground font-semibold">{row.pro}</td>
                    <td className="p-4 border-b border-border/30 text-foreground">{row.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
