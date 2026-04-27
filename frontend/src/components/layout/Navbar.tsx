import { Bell, Search, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCoach } from '@/hooks/useCoach';

interface Props {
  title?: string;
}

export default function Navbar({ title }: Props) {
  const { coach } = useCoach();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 px-6 flex items-center justify-between border-b border-white/8 bg-white/2 backdrop-blur-sm"
    >
      <div>
        {title && <h1 className="text-lg font-bold text-white">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center
                           text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <Search size={16} />
        </button>
        <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center
                           text-white/50 hover:text-white hover:bg-white/10 transition-all relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-green rounded-full" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center
                           text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <Settings size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green/40
                          flex items-center justify-center text-neon-green text-sm font-bold">
            {coach?.full_name?.charAt(0) || 'C'}
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-sm font-semibold leading-none">{coach?.full_name || 'Coach'}</p>
            <p className="text-white/40 text-xs">{coach?.specialization || 'Fitness Coach'}</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
