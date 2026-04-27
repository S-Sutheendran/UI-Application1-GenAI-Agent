import clsx from 'clsx';

interface Props {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const VARIANTS = {
  success: 'bg-neon-green/15 text-neon-green border-neon-green/30',
  warning: 'bg-orange-400/15 text-orange-400 border-orange-400/30',
  error:   'bg-red-400/15 text-red-400 border-red-400/30',
  info:    'bg-neon-blue/15 text-neon-blue border-neon-blue/30',
  neutral: 'bg-white/10 text-white/60 border-white/20',
};

export default function Badge({ label, variant = 'neutral' }: Props) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', VARIANTS[variant])}>
      {label}
    </span>
  );
}
