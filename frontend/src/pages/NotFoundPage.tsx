import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore } from '@/store';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-6xl font-extrabold text-heading tracking-tight mb-4">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h2>
      
      <p className="text-muted font-medium max-w-md mx-auto mb-8">
        Oops! The page you are looking for does not exist. It might have been moved, deleted, or the URL might be misspelled.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-lg border border-border hover:bg-secondary text-foreground font-semibold flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Home className="w-4 h-4" /> Home
        </Link>
      </div>
    </div>
  );
};
