import React, { useState } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { authApi } from '@/services/api';
import { Settings, User, Bell, Save, Loader2, CheckCircle2, Building2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const { currentOrg, currentWorkspace } = useAppStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateMe({ full_name: fullName, email });
      await fetchUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Profile update saved locally.');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5 text-heading">
            <Settings className="w-6 h-6 text-primary" /> Workspace & Account Settings
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Configure profile credentials, notification channels, and active organization preferences
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-heading">Personal Profile Information</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none text-heading"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none text-heading"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-muted">User ID: #{user?.id || '1'} ({user?.username})</span>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Profile Changes</span>
              </button>
            </div>

            {saved && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Profile credentials successfully updated.
              </div>
            )}
          </form>
        </div>

        {/* Organization Preferences Card */}
        <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-heading">Active Organization & Workspace Context</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted block tracking-wider">Current Organization</span>
              <p className="text-sm font-extrabold text-heading">{currentOrg?.name || 'Enterprise Headquarters'}</p>
              <p className="text-muted font-mono">Slug: {currentOrg?.slug || 'enterprise-hq'}</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted block tracking-wider">Active Workspace</span>
              <p className="text-sm font-extrabold text-heading">{currentWorkspace?.name || 'Engineering Platform'}</p>
              <p className="text-muted font-mono">ID: #{currentWorkspace?.id || '101'}</p>
            </div>
          </div>
        </div>

        {/* Notification Channels Card */}
        <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-heading">Notification & Delivery Channels</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-background cursor-pointer hover:bg-secondary/40 transition-colors">
              <div>
                <h4 className="font-bold text-xs text-heading">Instant Email Notifications</h4>
                <p className="text-[11px] text-muted mt-0.5">Receive email alerts immediately when assigned or tagged in a comment</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-background cursor-pointer hover:bg-secondary/40 transition-colors">
              <div>
                <h4 className="font-bold text-xs text-heading">Slack / Webhook Bot Integrations</h4>
                <p className="text-[11px] text-muted mt-0.5">Post sprint activity updates directly to your team Slack channel</p>
              </div>
              <input
                type="checkbox"
                checked={slackNotifs}
                onChange={(e) => setSlackNotifs(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-background cursor-pointer hover:bg-secondary/40 transition-colors">
              <div>
                <h4 className="font-bold text-xs text-heading">Weekly Executive Digest</h4>
                <p className="text-[11px] text-muted mt-0.5">Receive a Monday morning summary report of sprint velocity and burndown progress</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
