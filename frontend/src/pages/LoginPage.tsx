import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader2, ShieldAlert, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { useAuthStore } from '@/store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('remembered_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (rememberMe) {
        localStorage.setItem('remembered_username', username);
      } else {
        localStorage.removeItem('remembered_username');
      }
      await login(username, password);
      navigate('/dashboard');
    } catch {
      // error state handled cleanly in store via formatApiError
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-heading">Sign in to workspace</h2>
        <p className="text-muted text-xs">
          Enter your organization credentials to access active sprints and boards.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}



      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-heading mb-1.5">Username or Email</label>
          <input
            type="text"
            required
            disabled={isLoading}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/60 disabled:opacity-50"
            placeholder="e.g. alex.morgan or alex@enterprise.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-heading">Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[11px] text-primary hover:underline cursor-pointer font-medium focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/60 disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors focus:outline-none select-none"
          >
            {rememberMe ? (
              <CheckSquare className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-muted shrink-0" />
            )}
            <span className="font-medium">Remember my username</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>{isLoading ? 'Authenticating...' : 'Continue to Workspace'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full h-10 rounded-lg bg-secondary border border-border hover:bg-secondary/80 text-heading font-semibold text-xs flex items-center justify-center transition-all"
          >
            Continue as Guest (No Login Required)
          </button>
        </div>
      </form>

      <div className="pt-4 border-t border-border text-center text-xs text-muted">
        Don't have an organization account?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Request Enterprise Invite / Register
        </Link>
      </div>
    </div>
  );
};
