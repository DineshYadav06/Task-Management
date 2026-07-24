import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, ChevronDown, CheckSquare, Users, ShieldCheck, Zap,
  FolderKanban, MessageSquare, Clock, BarChart, Settings, Search,
  Menu, X, Sun, Moon, Sparkles, Globe, ChevronRight,
  ListTodo, Flag, Calendar, Activity, Map, Video, Key, Lock, Target
} from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';

const navData = {
  features: {
    title: 'Features',
    categories: [
      {
        name: 'Platform Capabilities',
        icon: <Layers className="w-5 h-5 text-blue-500" />,
        links: [
          { label: 'Task Management', href: '/features#tasks', description: 'Create, assign, and track tasks with ease' },
          { label: 'Project Management', href: '/features#projects', description: 'Kanban boards, sprints, and timelines' },
          { label: 'Team Collaboration', href: '/features#collaboration', description: 'Real-time chat, video, and workspaces' },
          { label: 'Enterprise Security', href: '/features#security', description: 'RBAC, SSO, and detailed Audit Logs' },
        ]
      }
    ]
  },
  solutions: {
    title: 'Solutions',
    categories: [
      {
        name: 'By Team',
        icon: <Users className="w-5 h-5 text-primary" />,
        links: [
          { label: 'Software Development', href: '/solutions#software' },
          { label: 'Startup Teams', href: '/solutions#startups' },
          { label: 'Enterprise Companies', href: '/solutions#enterprise' },
          { label: 'Marketing Teams', href: '/solutions#marketing' },
          { label: 'HR Teams', href: '/solutions#hr' },
          { label: 'Sales & Finance', href: '/solutions#sales' },
        ]
      },
      {
        name: 'By Industry',
        icon: <Layers className="w-5 h-5 text-emerald-500" />,
        links: [
          { label: 'Information Technology', href: '/solutions#it' },
          { label: 'Manufacturing', href: '/solutions#manufacturing' },
          { label: 'Banking & Finance', href: '/solutions#banking' },
          { label: 'Construction', href: '/solutions#construction' },
          { label: 'Logistics', href: '/solutions#logistics' },
          { label: 'Agencies', href: '/solutions#agencies' },
        ]
      }
    ]
  },
  pricing: {
    title: 'Pricing',
    categories: [
      {
        name: 'Plans',
        icon: <Zap className="w-5 h-5 text-amber-500" />,
        links: [
          { label: 'Free (Up to 5 Users)', href: '/pricing#free', description: 'Basic Tasks, Dashboard, Limited Storage' },
          { label: 'Professional', href: '/pricing#pro', description: 'Unlimited Tasks & Projects, AI Features, Reports' },
          { label: 'Enterprise', href: '/pricing#enterprise', description: 'Unlimited Everything, SSO, Custom Roles' },
        ]
      },
      {
        name: 'Help & Upgrades',
        icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
        links: [
          { label: 'Compare Plans', href: '/pricing#compare' },
          { label: 'Contact Sales', href: '/contact' },
          { label: 'Start Free Trial', href: '/register' },
        ]
      }
    ]
  },
  resources: {
    title: 'Resources',
    categories: [
      {
        name: 'Learning',
        icon: <Settings className="w-5 h-5 text-purple-500" />,
        links: [
          { label: 'Documentation', href: '/docs' },
          { label: 'API Docs', href: '/docs#api' },
          { label: 'Tutorials', href: '/resources#tutorials' },
          { label: 'Guides & Video Library', href: '/resources#guides' },
        ]
      },
      {
        name: 'Community & Devs',
        icon: <Users className="w-5 h-5 text-emerald-500" />,
        links: [
          { label: 'Blog', href: '/blog' },
          { label: 'Help Center', href: '/contact' },
          { label: 'Changelog', href: '/changelog' },
          { label: 'REST API & SDK', href: '/docs#developers' },
          { label: 'GitHub Integrations', href: '/integrations' },
        ]
      },
      {
        name: 'Company',
        icon: <Activity className="w-5 h-5 text-amber-500" />,
        links: [
          { label: 'About Us', href: '/about' },
          { label: 'Careers', href: '/careers' },
          { label: 'Contact', href: '/contact' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms & Security', href: '/terms' },
        ]
      }
    ]
  }
};

export const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let leaveTimeout: ReturnType<typeof setTimeout>;

  const handleMouseEnter = (menu: string) => {
    clearTimeout(leaveTimeout);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    leaveTimeout = setTimeout(() => {
      setActiveMenu(null);
    }, 150); // slight delay to make moving to dropdown smooth
  };

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-surface/90 backdrop-blur-xl border-border shadow-sm py-2' : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <Layers className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-heading tracking-tight block leading-none">TaskMaster</span>
              <span className="text-xs text-primary font-bold uppercase tracking-wider block mt-0.5">Enterprise Cloud</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 relative z-40" onMouseLeave={handleMouseLeave}>
            <Link 
              to="/" 
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 text-heading hover:bg-secondary/50 hover:text-primary`}
            >
              Home
            </Link>
            {Object.entries(navData).map(([key, data]) => (
              <div 
                key={key} 
                className="relative"
                onMouseEnter={() => handleMouseEnter(key)}
              >
                <button 
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeMenu === key ? 'bg-secondary text-primary' : 'text-heading hover:bg-secondary/50 hover:text-primary'
                  }`}
                >
                  {data.title}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeMenu === key ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                </button>

                {/* Mega Dropdown */}
                <AnimatePresence>
                  {activeMenu === key && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 ${data.categories.length > 2 ? 'w-[750px] xl:w-[850px]' : 'w-[500px]'}`}
                    >
                      <div className="bg-surface/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                        {/* Decorative Background Blur */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <div className={`grid gap-8 relative z-10 ${data.categories.length > 2 ? 'grid-cols-2 lg:grid-cols-2' : 'grid-cols-2'}`}>
                          {data.categories.map((category, idx) => (
                            <div key={idx} className="space-y-4">
                              <h3 className="flex items-center gap-2 text-sm font-bold text-heading uppercase tracking-wider mb-2 border-b border-border/50 pb-2">
                                {category.icon}
                                {category.name}
                              </h3>
                              <ul className="space-y-2">
                                {category.links.map((link, lIdx) => (
                                  <li key={lIdx}>
                                    <Link 
                                      to={link.href}
                                      className="group flex items-start gap-3 p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      {link.icon && (
                                        <div className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                                          {link.icon}
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                          {link.label}
                                        </div>
                                        {link.description && (
                                          <div className="text-xs text-muted-foreground mt-0.5">
                                            {link.description}
                                          </div>
                                        )}
                                      </div>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3 relative z-50">
            <button className="hidden xl:flex items-center gap-2 text-muted-foreground hover:text-heading transition-colors px-2 py-1 rounded-md text-sm font-medium">
              <Globe className="w-4 h-4" />
              <span>EN</span>
            </button>
            <button 
              onClick={() => {
                alert("Global Search for Marketing Pages is currently a placeholder. Navigate to the App for full search functionality.");
              }}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-heading transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-heading transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="w-px h-6 bg-border mx-2" />

            {isAuthenticated && user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-heading text-sm font-bold transition-all border border-border shadow-xs"
              >
                Dashboard
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2 rounded-full hover:bg-secondary text-heading text-sm font-bold transition-all"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden relative z-50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-heading transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-secondary text-heading transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Mega Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden absolute top-full left-0 w-full bg-surface/95 backdrop-blur-xl border-b border-border overflow-y-auto"
          >
            <div className="p-6 space-y-6 pb-24">
              <div className="space-y-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-extrabold text-heading border-b border-border pb-2 hover:text-primary transition-colors">
                  Home
                </Link>
              </div>
              {Object.entries(navData).map(([key, data]) => (
                <div key={key} className="space-y-4">
                  <h2 className="text-xl font-extrabold text-heading border-b border-border pb-2">{data.title}</h2>
                  <div className="space-y-6 pl-2">
                    {data.categories.map((cat, idx) => (
                      <div key={idx}>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase mb-3">
                          {cat.icon}
                          {cat.name}
                        </h3>
                        <ul className="space-y-3 pl-7">
                          {cat.links.map((link, lIdx) => (
                            <li key={lIdx}>
                              <Link 
                                to={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-base font-semibold text-foreground hover:text-primary transition-colors flex items-center justify-between"
                              >
                                {link.label}
                                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t border-border space-y-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-center shadow-lg shadow-primary/20"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                      className="w-full py-3 rounded-xl border border-border bg-secondary text-heading font-bold text-center"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                      className="w-full py-3 rounded-xl bg-primary text-white font-bold text-center shadow-lg shadow-primary/20"
                    >
                      Get Started Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
