import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, CheckSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border mt-20 py-16 px-6 lg:px-12 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2 md:col-span-1 space-y-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg">
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-heading">TaskMaster</span>
          </Link>
          <p className="text-sm font-medium text-muted leading-relaxed">
            The enterprise operating system for modern engineering teams. Build better software, faster.
          </p>
          <div className="flex items-center gap-4 text-muted">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-heading mb-4 text-sm uppercase tracking-wider">Product</h4>
          <ul className="space-y-3 text-sm font-medium text-muted">
            <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
            <li><Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
            <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link to="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
            <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-heading mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-3 text-sm font-medium text-muted">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link to="/partners" className="hover:text-primary transition-colors">Partners</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-heading mb-4 text-sm uppercase tracking-wider">Legal</h4>
          <ul className="space-y-3 text-sm font-medium text-muted">
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            <li><Link to="/security" className="hover:text-primary transition-colors">Security</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted">
          &copy; {new Date().getFullYear()} TaskMaster Enterprise. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm font-medium text-muted">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> All systems operational</span>
        </div>
      </div>
    </footer>
  );
};
