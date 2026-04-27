import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: number;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'pink';
  delay?: number;
}

const COLOR_MAP = {
  green:  { bg: 'bg-neon-green/10',  text: 'text-neon-green',  border: 'border-neon-green/20'  },
  blue:   { bg: 'bg-neon-blue/10',   text: 'text-neon-blue',   border: 'border-neon-blue/20'   },
  purple: { bg: 'bg-purple-400/10',  text: 'text-purple-400',  border: 'border-purple-400/20'  },
  orange: { bg: 'bg-orange-400/10',  text: 'text-orange-400',  border: 'border-orange-400/20'  },
  pink:   { bg: 'bg-pink-400/10',    text: 'text-pink-400',    border: 'border-pink-400/20'    },
};

export default function StatCard({ title, value, subtitle, icon, trend, color = 'green', delay = 0 }: Props) {
  const c = COLOR_MAP[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass-card p-5 border ${c.border} relative overflow-hidden group hover:shadow-neon transition-all duration-300`}
    >
      <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>

      {trend !== undefined && (
        <div className="relative z-10 mt-3 flex items-center gap-1">
          {trend > 0 ? (
            <TrendingUp size={14} className="text-neon-green" />
          ) : trend < 0 ? (
            <TrendingDown size={14} className="text-red-400" />
          ) : (
            <Minus size={14} className="text-white/40" />
          )}
          <span className={`text-xs font-semibold ${trend > 0 ? 'text-neon-green' : trend < 0 ? 'text-red-400' : 'text-white/40'}`}>
            {trend > 0 ? '+' : ''}{trend}% vs last month
          </span>
        </div>
      )}
    </motion.div>
  );
}
