import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader2, ShieldAlert, Eye, EyeOff, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { authApi, formatApiError } from '@/services/api';
import { useAuthStore } from '@/store';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // File upload state
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        setKeyFile(file);
      } else {
        setError('Only .txt security key files are allowed.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setKeyFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyFile) {
      setError('Security key file is required for admin login.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('key_file', keyFile);

      const response = await authApi.adminLogin(formData);
      
      if (response.token) {
        localStorage.setItem('access_token', response.token);
        useAuthStore.setState({ token: response.token });
        await fetchUser();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-heading">Admin Secure Portal</h2>
        <p className="text-muted text-xs">
          Authenticate using your administrative credentials and security key file.
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
          <label className="block text-xs font-bold text-heading mb-1.5">Admin Email</label>
          <input
            type="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/60 disabled:opacity-50"
            placeholder="admin@enterprise.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-heading mb-1.5">Master Password</label>
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

        {/* Drag and Drop Zone */}
        <div>
          <label className="block text-xs font-bold text-heading mb-1.5">Security Key File (.txt)</label>
          <div 
            className={`w-full relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border bg-surface hover:border-primary/50 hover:bg-secondary/50'}
              ${keyFile ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".txt,text/plain" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {keyFile ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600 animate-in zoom-in duration-300">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">{keyFile.name}</span>
                <span className="text-[10px] text-emerald-600/70 font-medium">Click to replace file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-foreground/70" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-foreground block">Click to upload or drag and drop</span>
                  <span className="text-xs font-medium block mt-1">Upload your .txt key file</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            type="submit"
            disabled={isLoading || !keyFile}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate Admin'}</span>
          </button>
        </div>
      </form>

      <div className="pt-4 border-t border-border flex flex-col items-center gap-2 text-xs text-muted">
        <div>
          Not an admin?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Return to User Login
          </Link>
        </div>
        <div>
          New admin?{' '}
          <Link to="/admin-signup" className="text-primary font-bold hover:underline">
            Register Admin Credentials
          </Link>
        </div>
      </div>
    </div>
  );
};
