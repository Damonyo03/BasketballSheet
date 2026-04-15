'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

// ---- Inline SVG Icons ----
function LiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" fill={active ? '#FF6B1A' : 'rgba(255,255,255,0.4)'} />
      <circle cx="12" cy="12" r="7.5" stroke={active ? '#FF6B1A' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="10.5" stroke={active ? 'rgba(255,107,26,0.3)' : 'rgba(255,255,255,0.08)'} strokeWidth="1" />
    </svg>
  );
}

function StandingsIcon({ active }: { active: boolean }) {
  const col = active ? '#FF6B1A' : 'rgba(255,255,255,0.4)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="5" height="12" rx="1.5" fill={active ? col : 'rgba(255,255,255,0.15)'} />
      <rect x="9.5" y="6" width="5" height="16" rx="1.5" fill={col} />
      <rect x="17" y="13" width="5" height="9" rx="1.5" fill={active ? col : 'rgba(255,255,255,0.15)'} />
    </svg>
  );
}

function StatsIcon({ active }: { active: boolean }) {
  const col = active ? '#FF6B1A' : 'rgba(255,255,255,0.4)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="3.5" stroke={col} strokeWidth="1.8" />
      <circle cx="12" cy="8" r="1" fill={col} />
      <path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={col} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 21v-2m6 2v-3" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AdminIcon({ active }: { active: boolean }) {
  const col = active ? '#FF6B1A' : 'rgba(255,255,255,0.4)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke={col} strokeWidth="2" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={col} strokeWidth="2" />
    </svg>
  );
}

// ---- Nav Config ----
type IconComponent = React.ComponentType<{ active: boolean }>;

const publicNavItems = [
  { id: 'live',      label: 'Live Scoring', href: '/',          Icon: LiveIcon },
  { id: 'standings', label: 'Standings',    href: '/standings', Icon: StandingsIcon },
  { id: 'stats',     label: 'Player Stats', href: '/stats',     Icon: StatsIcon },
];

// ---- Component ----
export default function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  const navItems = [...publicNavItems];
  if (profile) {
    navItems.push({ id: 'admin', label: 'Dashboard', href: '/dashboard', Icon: AdminIcon });
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="glass"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px 28px 0 0',
        }}
      >
        <div className="flex items-center justify-around px-2 py-3" style={{ height: '82px' }}>
          {navItems.map(({ id, label, href, Icon }) => {
            const isActive = pathname === href || (id === 'admin' && pathname.startsWith('/dashboard'));
            return (
              <button
                key={id}
                onClick={() => router.push(href)}
                className="press-scale flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-2xl relative"
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span
                    className="absolute inset-x-2 inset-y-1 rounded-2xl"
                    style={{
                      background: 'rgba(255, 107, 26, 0.12)',
                      border: '1px solid rgba(255, 107, 26, 0.25)',
                    }}
                  />
                )}

                <span className="relative z-10 transition-transform duration-300" style={{ transform: isActive ? 'scale(1.1) translateY(-2px)' : 'scale(1)' }}>
                  <Icon active={isActive} />
                </span>

                <span
                  className={cn(
                    'relative z-10 text-[9px] font-bold tracking-[0.1em] uppercase transition-colors duration-200',
                    isActive ? 'text-orange-400' : 'text-white/30'
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
