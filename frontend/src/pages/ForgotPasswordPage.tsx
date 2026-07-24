import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 animate-fadeIn">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold shadow-md mb-4">
          <Layers className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-heading tracking-tight">Reset Password</h2>
        <p className="text-sm text-muted font-medium mt-2 text-center">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      {success ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-fadeIn">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="font-bold text-heading mb-2">Check your inbox</h3>
          <p className="text-xs text-muted font-medium mb-6">
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <Link
            to="/login"
            className="block w-full py-2.5 rounded-lg bg-surface border border-border hover:bg-secondary text-heading text-sm font-bold transition-all shadow-xs"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-600 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-heading block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-heading transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
