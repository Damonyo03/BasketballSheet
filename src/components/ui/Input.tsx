'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1.5 animate-slide-up">
      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 ml-1">
        {label}
      </label>
      <div className="relative group">
        <input
          className={cn(
            'w-full glass glass-hover rounded-2xl px-4 py-3.5 text-sm font-medium text-white placeholder:text-white/20',
            'transition-all duration-200 outline-none',
            'focus:border-orange-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(255,107,26,0.1)]',
            error ? 'border-red-500/50 bg-red-500/5' : '',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[9px] font-bold text-red-400 mt-1 ml-1 tracking-wide uppercase">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
