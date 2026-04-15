import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowOrange?: boolean;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className,
  glowOrange = false,
  onClick,
  hover = false,
}: GlassCardProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'glass rounded-3xl p-4 w-full text-left',
        hover && 'glass-hover',
        onClick && 'press-scale cursor-pointer',
        glowOrange && 'glow-orange',
        className
      )}
    >
      {children}
    </Tag>
  );
}
