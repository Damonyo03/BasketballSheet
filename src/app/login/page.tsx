'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import GlassCard from '@/components/ui/GlassCard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Success! The AuthProvider will handle profile state.
    // Redirection will happen once the profile is loaded.
    router.push('/');
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 pt-12 pb-24 animate-slide-up">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500/80 mb-2">
          Management Portal
        </p>
        <h1 className="font-display text-4xl brand-gradient-text">Sign In</h1>
      </div>

      <GlassCard className="max-w-md w-full space-y-6 !p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="juan@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <div className="space-y-1">
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <div className="flex justify-end pr-1">
              <Link href="/forgot-password" disabled={loading} className="text-[9px] font-bold text-orange-400/60 hover:text-orange-400 uppercase tracking-widest">
                Forgot Password?
              </Link>
            </div>
          </div>

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
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-[11px] text-white/40 tracking-wide">
            New to the system?{' '}
            <Link href="/register" className="text-orange-400 font-bold hover:underline">
              CREATE ACCOUNT
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
