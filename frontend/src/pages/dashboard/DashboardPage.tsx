import { motion } from 'framer-motion';
import { Users, Dumbbell, Utensils, TrendingUp, Star, Activity, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCoach, useCoachStats } from '@/hooks/useCoach';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/services/api';
import type { Client } from '@/types';
import Badge from '@/components/ui/Badge';

const QUICK_ACTIONS = [
  { icon: Users,   label: 'Add Client',    to: '/clients',   color: 'text-neon-green',  bg: 'bg-neon-green/10'   },
  { icon: Dumbbell,label: 'New Workout',   to: '/workouts',  color: 'text-neon-blue',   bg: 'bg-neon-blue/10'    },
  { icon: Utensils,label: 'Meal Plan',     to: '/meals',     color: 'text-purple-400',  bg: 'bg-purple-400/10'   },
  { icon: Activity,label: 'Add Progress',  to: '/insights',  color: 'text-orange-400',  bg: 'bg-orange-400/10'   },
];

function CoachHero({ coach, stats }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative glass-card overflow-hidden mb-6 rounded-2xl"
      style={{ background: 'linear-gradient(135deg, rgba(0,255,135,0.05) 0%, rgba(0,180,216,0.03) 100%)' }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl border-2 border-neon-green/30 bg-neon-green/10
                          flex items-center justify-center text-3xl font-black text-neon-green overflow-hidden">
            {coach?.avatar_url
              ? <img src={coach.avatar_url} alt="" className="w-full h-full object-cover" />
              : (coach?.full_name?.charAt(0) || 'C')
            }
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neon-green
                          border-2 border-dark-300" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h2 className="text-2xl font-black text-white">{coach?.full_name || 'Welcome, Coach'}</h2>
            <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/20
                            px-2.5 py-0.5 rounded-full">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold">{coach?.rating?.toFixed(1) || '—'}</span>
            </div>
          </div>
          <p className="text-neon-green text-sm font-semibold mb-1">
            {coach?.specialization || 'Fitness & Wellness Coach'}
          </p>
          <p className="text-white/40 text-sm max-w-lg">
            {coach?.bio || 'Welcome to your coaching dashboard. Start by adding clients and building workout plans.'}
          </p>
          <div className="flex gap-4 mt-3 flex-wrap">
            <span className="text-white/50 text-xs">{coach?.experience_years || 0} yrs experience</span>
            {coach?.certifications && (
              <span className="text-white/50 text-xs">🏅 {coach.certifications}</span>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          {[
            { label: 'Clients', value: stats?.total_clients ?? '—' },
            { label: 'Sessions', value: stats?.total_sessions ?? '—' },
            { label: 'Compliance', value: stats?.avg_compliance ? `${stats.avg_compliance}%` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-neon-green">{value}</p>
              <p className="text-white/40 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function RecentClients({ clients }: { clients: Client[] }) {
  const navigate = useNavigate();
  const recent = clients.slice(0, 5);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Recent Clients</h3>
        <button
          onClick={() => navigate('/clients')}
          className="text-neon-green text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          View all <ArrowRight size={14} />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-white/30 text-sm">No clients yet. Add your first client!</p>
          <button onClick={() => navigate('/clients')} className="neon-btn-outline mt-3 text-sm px-4 py-2">
            Add Client
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ x: 4 }}
              onClick={() => navigate(`/clients/${c.id}`)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer
                         border border-transparent hover:border-white/10 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20
                              flex items-center justify-center text-neon-green font-bold text-sm">
                {c.avatar_url
                  ? <img src={c.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                  : c.full_name.charAt(0)
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{c.full_name}</p>
                <p className="text-white/40 text-xs truncate">{c.fitness_goal || c.fitness_level}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-neon-green text-xs font-bold">{c.streak_days}d streak</p>
                  <p className="text-white/30 text-xs">{c.compliance_rate}% comply</p>
                </div>
                <Badge
                  label={c.is_active ? 'Active' : 'Inactive'}
                  variant={c.is_active ? 'success' : 'neutral'}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { coach, isLoading: coachLoading } = useCoach();
  const { stats, isLoading: statsLoading } = useCoachStats();
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then((r) => r.data),
  });

  if (coachLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-white/40 text-sm">Here's what's happening with your coaching business today.</p>
      </div>

      <CoachHero coach={coach} stats={stats} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={statsLoading ? '...' : stats?.total_clients ?? 0}
          subtitle="Enrolled athletes"
          icon={<Users size={22} />}
          trend={12}
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Active Clients"
          value={statsLoading ? '...' : stats?.active_clients ?? 0}
          subtitle="Currently training"
          icon={<Activity size={22} />}
          color="blue"
          delay={0.15}
        />
        <StatCard
          title="Sessions Done"
          value={statsLoading ? '...' : stats?.total_sessions ?? 0}
          subtitle="All time"
          icon={<Dumbbell size={22} />}
          trend={8}
          color="purple"
          delay={0.2}
        />
        <StatCard
          title="Avg Compliance"
          value={statsLoading ? '...' : `${stats?.avg_compliance ?? 0}%`}
          subtitle="Plan adherence"
          icon={<TrendingUp size={22} />}
          trend={3}
          color="orange"
          delay={0.25}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent clients */}
        <div className="lg:col-span-2">
          <RecentClients clients={clients} />
        </div>

        {/* Quick actions + upcoming */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="section-title">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map(({ icon: Icon, label, to, color, bg }) => (
                <motion.button
                  key={to}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(to)}
                  className={`${bg} border border-white/10 rounded-xl p-4 text-center
                               hover:border-white/20 transition-all duration-200`}
                >
                  <Icon size={22} className={`${color} mx-auto mb-2`} />
                  <p className="text-white text-xs font-semibold">{label}</p>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-neon-green" />
              <h3 className="text-sm font-semibold text-white/90">Today's Schedule</h3>
            </div>
            <div className="space-y-2">
              {[
                { time: '09:00', client: 'Morning Assessment', type: 'Check-in' },
                { time: '11:30', client: 'Strength Block', type: 'Workout' },
                { time: '15:00', client: 'Nutrition Review', type: 'Meal' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3">
                  <span className="text-neon-green text-xs font-mono font-bold w-12 shrink-0">{s.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{s.client}</p>
                    <p className="text-white/30 text-xs">{s.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
