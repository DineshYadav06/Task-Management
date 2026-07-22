import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/kanban');
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
        <p className="text-muted-foreground text-sm">
          Set up your organization owner credentials to start collaborating
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Alex Morgan"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Username</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. alexm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Work Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="alex@company.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          <span>Start Enterprise Trial</span>
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
};
