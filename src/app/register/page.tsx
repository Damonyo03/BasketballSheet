'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import GlassCard from '@/components/ui/GlassCard';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // In a real app, we might wait for email verification or redirect
      // For this flow, since they are "pending", we'll show a message
    }
  };

  if (success) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 animate-slide-up">
        <GlassCard className="max-w-md w-full text-center space-y-6 !p-8">
          <div className="w-16 h-16 rounded-full brand-gradient mx-auto flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
          <div>
            <h1 className="font-display text-3xl brand-gradient-text">Registration Sent</h1>
            <p className="text-sm text-white/60 mt-2">
              Your account is currently <span className="text-orange-400 font-bold">PENDING</span>.
              The Developer will review and approve your access shortly.
            </p>
          </div>
          <Link 
            href="/login" 
            className="press-scale block w-full py-3.5 rounded-2xl brand-gradient text-sm font-bold tracking-widest uppercase shadow-lg shadow-orange-500/20"
          >
            Back to Login
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 pt-12 pb-24 animate-slide-up">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500/80 mb-2">
          Join the League
        </p>
        <h1 className="font-display text-4xl brand-gradient-text">Create Account</h1>
      </div>

      <GlassCard className="max-w-md w-full space-y-6 !p-8">
        <form onSubmit={handleRegister} className="space-y-5">
          <Input 
            label="Full Name" 
            placeholder="Juan Dela Cruz" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="juan@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          {error && (
            <div className="glass bg-red-500/10 border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="press-scale w-full py-4 rounded-2xl brand-gradient text-sm font-bold tracking-widest uppercase shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Register Now'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-[11px] text-white/40 tracking-wide">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-400 font-bold hover:underline">
              SIGN IN
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
