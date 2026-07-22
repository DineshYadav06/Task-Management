import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/kanban');
    } catch {
      // error state handled in store
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to access your enterprise workspaces and live boards
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Username or Email</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter username..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          <span>Sign In to Platform</span>
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don't have an organization account yet?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Create Enterprise Account
        </Link>
      </div>
    </div>
  );
};
