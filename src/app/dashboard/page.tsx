'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRouter() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      router.push('/login');
      return;
    }

    // Direct based on role
    switch (profile.role) {
      case 'developer':
        router.push('/dashboard/developer');
        break;
      case 'commissioner':
        router.push('/dashboard/commissioner');
        break;
      case 'committee':
        router.push('/dashboard/committee');
        break;
      default:
        // Public users or others can't see the dashboard
        router.push('/');
    }
  }, [profile, loading, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
}
