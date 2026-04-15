'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import GlassCard from '@/components/ui/GlassCard';
import { useRouter } from 'next/navigation';

export default function PendingApproval() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  if (!profile || profile.status === 'approved') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-bg-primary/95 backdrop-blur-xl flex items-center justify-center px-6">
      <GlassCard className="max-w-md w-full text-center space-y-6 !p-8 animate-slide-up shadow-[0_0_50px_rgba(255,107,26,0.15)]">
        <div className="w-20 h-20 rounded-full brand-gradient mx-auto flex items-center justify-center relative">
          <span className="text-3xl animate-pulse">⏳</span>
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping" />
        </div>
        
        <div>
          <h1 className="font-display text-4xl brand-gradient-text tracking-wider">Account Pending</h1>
          <p className="text-sm text-white/50 mt-4 leading-relaxed">
            Hello, <span className="text-white font-bold">{profile.full_name || 'User'}</span>. 
            Your registration has been received and is currently in the 
            <span className="text-orange-400 font-bold ml-1">PENDING QUEUE</span>.
          </p>
          <p className="text-xs text-white/30 mt-4 italic">
            Please wait for the Developer to approve your credentials. 
            You will be notified once access is granted.
          </p>
        </div>

        <button 
          onClick={() => signOut()}
          className="press-scale block w-full py-4 rounded-2xl glass glass-hover text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-white transition-all"
        >
          Sign Out & Return Home
        </button>
      </GlassCard>
    </div>
  );
}
