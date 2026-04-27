import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Dumbbell, Utensils, BarChart3,
  Brain, LogOut, Zap, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/clients',   icon: Users,           label: 'Clients'       },
  { to: '/workouts',  icon: Dumbbell,        label: 'Workout Plans' },
  { to: '/meals',     icon: Utensils,        label: 'Meal Plans'    },
  { to: '/performance', icon: BarChart3,     label: 'Performance'   },
  { to: '/insights',  icon: Brain,           label: 'Insights'      },
];

export default function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="w-64 min-h-screen glass-card rounded-none border-r border-white/8 flex flex-col py-6"
    >
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon-green flex items-center justify-center">
            <Zap size={18} className="text-dark-300" fill="currentColor" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">FitCoach</p>
            <p className="text-neon-green text-xs font-semibold">PRO</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-neon-green/15 text-neon-green border border-neon-green/20'
                  : 'text-white/55 hover:text-white hover:bg-white/8'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-neon-green' : 'text-white/50 group-hover:text-white'} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-neon-green/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 mt-4">
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
