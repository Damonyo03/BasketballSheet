'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import GlassCard from '@/components/ui/GlassCard';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'developer' | 'commissioner' | 'committee' | 'public_user';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default function DeveloperDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const supabase = createClient();
  const { profile } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data as Profile[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateStatus = async (userId: string, status: 'approved' | 'rejected', role?: string) => {
    setActionLoading(userId);
    const updates: any = { status };
    if (role) updates.role = role;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (!error) {
      fetchUsers();
    }
    setActionLoading(null);
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const managedUsers = users.filter(u => u.status !== 'pending' && u.id !== profile?.id);

  return (
    <div className="px-4 pt-6 pb-24 space-y-6 animate-slide-up">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500/80 mb-1">
          System Admin
        </p>
        <h1 className="font-display text-4xl brand-gradient-text">Developer Dashboard</h1>
      </header>

      {/* --- Pending Section --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 ml-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,107,26,0.5)]" />
          <h2 className="text-sm font-bold tracking-[0.1em] uppercase text-white/60">
            Pending Approval ({pendingUsers.length})
          </h2>
        </div>

        {pendingUsers.length === 0 ? (
          <GlassCard className="!p-8 text-center text-white/30 italic text-sm">
            No pending user requests at the moment.
          </GlassCard>
        ) : (
          pendingUsers.map(user => (
            <GlassCard key={user.id} className=" flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white leading-tight">{user.full_name || 'Anonymous User'}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{user.email}</p>
                </div>
                <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded text-white/40 tracking-widest uppercase">
                  NEW
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUpdateStatus(user.id, 'approved', 'committee')}
                  disabled={!!actionLoading}
                  className="press-scale py-3 rounded-xl bg-orange-500 text-[11px] font-bold tracking-widest uppercase shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  Approve as Committee
                </button>
                <button
                  onClick={() => handleUpdateStatus(user.id, 'approved', 'commissioner')}
                  disabled={!!actionLoading}
                  className="press-scale py-3 rounded-xl bg-white/10 border border-white/10 text-[11px] font-bold tracking-widest uppercase hover:bg-white/20 disabled:opacity-50"
                >
                  Approve as Commish
                </button>
                <button
                  onClick={() => handleUpdateStatus(user.id, 'rejected')}
                  disabled={!!actionLoading}
                  className="press-scale py-3 rounded-xl bg-red-500/20 border border-red-500/20 text-[11px] font-bold tracking-widest uppercase text-red-400 disabled:opacity-50 col-span-2 mt-1"
                >
                  Reject Application
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </section>

      {/* --- Management Section --- */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-3 ml-1">
          <span className="w-2 h-2 rounded-full bg-white/20" />
          <h2 className="text-sm font-bold tracking-[0.1em] uppercase text-white/40">
            Approved Staff ({managedUsers.length})
          </h2>
        </div>

        <div className="space-y-3">
          {managedUsers.map(user => (
            <div key={user.id} className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{user.full_name}</p>
                <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wide">
                  {user.role} • {user.status}
                </p>
              </div>
              <button 
                onClick={() => handleUpdateStatus(user.id, 'rejected')}
                className="text-[10px] font-bold text-red-400/60 hover:text-red-400 tracking-widest uppercase transition-colors"
                disabled={!!actionLoading}
              >
                REVOKE
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
