import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, ShieldAlert, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-muted/40', textColor: 'text-muted' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500' };
    if (score === 4) return { score, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (formData.password.length < 8) {
      setClientError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== confirmPassword) {
      setClientError('Passwords do not match. Please re-check confirmation.');
      return;
    }

    try {
      await register(formData);
      navigate('/dashboard');
    } catch {
      // backend validation or conflict handled cleanly in store
    }
  };

  const displayError = clientError || error;

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-heading">Create Enterprise Account</h2>
        <p className="text-muted text-xs">
          Set up owner credentials for your cloud organization and initial workspace.
        </p>
      </div>

      {displayError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="leading-relaxed">{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-heading mb-1.5">Full Name</label>
          <input
            type="text"
            required
            disabled={isLoading}
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/60 disabled:opacity-50"
            placeholder="e.g. Alex Morgan"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-heading mb-1.5">Username</label>
          <input
            type="text"
            required
            disabled={isLoading}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/60 disabled:opacity-50"
            placeholder="e.g. alex.morgan"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-heading mb-1.5">Work Email</label>
          <input
            type="email"
            required
            disabled={isLoading}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/60 disabled:opacity-50"
            placeholder="alex@enterprise.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-heading mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-background border border-border rounded-lg pl-3.5 pr-10 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/60 disabled:opacity-50"
              placeholder="Min. 8 characters with letters & numbers"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-muted">Password Strength</span>
                <span className={strength.textColor}>{strength.label}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/20 overflow-hidden flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`flex-1 h-full transition-all duration-300 rounded-sm ${
                      strength.score >= lvl ? strength.color : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-heading mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-3.5 pr-10 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/60 disabled:opacity-50"
              placeholder="Confirm password exact match"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground focus:outline-none transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              {formData.password === confirmPassword ? (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Passwords match
                </span>
              ) : (
                <span className="text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || (confirmPassword !== '' && formData.password !== confirmPassword)}
          className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-3"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          <span>{isLoading ? 'Creating Workspace...' : 'Initialize Workspace Trial'}</span>
        </button>
      </form>

      <div className="pt-4 border-t border-border text-center text-xs text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
};
