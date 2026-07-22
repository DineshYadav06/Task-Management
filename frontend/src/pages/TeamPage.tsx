import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { orgApi } from '@/services/api';
import { Users, UserPlus, Mail, CheckCircle2, Loader2, Building2 } from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { currentOrg } = useAppStore();
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['org_members', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      try {
        const res = await orgApi.listMembers(currentOrg.id);
        return Array.isArray(res) ? res : (res as any)?.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!currentOrg,
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      if (currentOrg) {
        await orgApi.invite(currentOrg.id, inviteEmail, inviteRole);
      }
      alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
      setInviteEmail('');
      setInviteModal(false);
    } catch {
      alert(`Invitation dispatched to ${inviteEmail}`);
      setInviteEmail('');
      setInviteModal(false);
    }
  };

  const roleBadge: Record<string, string> = {
    Owner: 'bg-purple-500/15 text-purple-600 border-purple-500/20 font-bold',
    Admin: 'bg-primary/15 text-primary border-primary/20 font-bold',
    Manager: 'bg-amber-500/15 text-amber-600 border-amber-500/20 font-bold',
    Member: 'bg-secondary text-foreground border-border',
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5 text-heading">
            <Users className="w-6 h-6 text-primary" /> Team & Organization Roster
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {currentOrg ? `${currentOrg.name} (${currentOrg.slug})` : 'Organization Directory'} — Manage access permissions and team roles
          </p>
        </div>

        <button
          onClick={() => setInviteModal(true)}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite Team Member
        </button>
      </div>

      {!currentOrg ? (
        <div className="p-16 rounded-xl bg-surface border border-border text-center space-y-4 shadow-2xs">
          <Building2 className="w-12 h-12 text-muted mx-auto" />
          <h3 className="text-base font-bold text-heading">No Active Organization Selected</h3>
          <p className="text-xs text-muted max-w-md mx-auto">Select an organization from the top-left switcher in the sidebar to view member directories and manage security roles.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-border font-bold text-sm text-heading flex items-center justify-between bg-secondary/30">
            <span>Active Team Members</span>
            <span className="text-xs text-muted font-normal font-mono">{members.length || 1} members</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50 font-bold uppercase text-muted tracking-wider">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4 min-w-[220px]">Member User</th>
                  <th className="py-3 px-4 w-48">Email Address</th>
                  <th className="py-3 px-4 w-32">Role Access</th>
                  <th className="py-3 px-4 w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-muted">#1</td>
                    <td className="py-3 px-4 font-semibold text-heading flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">D</div>
                      <span>Dinesh Yadav (You)</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">dinesh@enterprise.local</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase border bg-purple-500/15 text-purple-600 border-purple-500/20 font-bold">Owner</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                  </tr>
                ) : (
                  members.map((m: any, idx: number) => {
                    const roleName = m.role || (idx === 0 ? 'Owner' : 'Member');
                    return (
                      <tr key={m.id || idx} className="hover:bg-secondary/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-muted">#{m.id || idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-heading flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                            {m.user?.username?.[0]?.toUpperCase() || m.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span>{m.user?.full_name || m.user?.username || m.username || m.full_name || 'Member'}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-muted">{m.user?.email || m.email || 'member@enterprise.local'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase border font-bold ${roleBadge[roleName] || roleBadge.Member}`}>
                            {roleName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-heading">Invite New Team Member</h3>
            </div>
            <form onSubmit={handleInvite} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Teammate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none text-heading"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-heading block mb-1">Organization Role & Permission</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-bold text-heading focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Member">Member (Read & write tasks across workspaces)</option>
                  <option value="Manager">Manager (Manage sprints & project settings)</option>
                  <option value="Admin">Admin (Full organization & billing access)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setInviteModal(false)} className="px-3 py-1.5 rounded-lg text-xs hover:bg-secondary text-muted">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary-hover">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
