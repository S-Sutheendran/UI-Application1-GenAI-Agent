import { motion } from 'framer-motion';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: Props) {
  const dims = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${dims[size]} rounded-full border-2 border-neon-green/20 border-t-neon-green`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="text-white/40 text-sm">{text}</p>}
    </div>
  );
}
