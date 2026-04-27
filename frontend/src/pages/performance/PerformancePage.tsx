import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/services/api';
import type { Client } from '@/types';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const WEEKLY_SESSIONS = [
  { week: 'Wk1', sessions: 12, completed: 10 },
  { week: 'Wk2', sessions: 15, completed: 14 },
  { week: 'Wk3', sessions: 14, completed: 12 },
  { week: 'Wk4', sessions: 18, completed: 17 },
  { week: 'Wk5', sessions: 16, completed: 15 },
  { week: 'Wk6', sessions: 20, completed: 19 },
];

const COMPLIANCE_TREND = [
  { month: 'Jan', compliance: 72 },
  { month: 'Feb', compliance: 78 },
  { month: 'Mar', compliance: 75 },
  { month: 'Apr', compliance: 83 },
  { month: 'May', compliance: 88 },
  { month: 'Jun', compliance: 91 },
];

const SKILL_RADAR = [
  { metric: 'Strength', value: 85 },
  { metric: 'Endurance', value: 70 },
  { metric: 'Flexibility', value: 60 },
  { metric: 'Nutrition', value: 88 },
  { metric: 'Recovery', value: 75 },
  { metric: 'Mindset', value: 80 },
];

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0a0a1a',
    border: '1px solid rgba(0,255,135,0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
  },
};

function SectionCard({ title, icon: Icon, children }: any) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-neon-green" />
        <h3 className="section-title mb-0">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function LeaderboardRow({ client, rank }: { client: Client; rank: number }) {
  const colors = ['text-yellow-400', 'text-gray-300', 'text-orange-600'];
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
      <span className={`text-lg font-black w-6 text-center ${colors[rank] || 'text-white/30'}`}>
        {rank <= 2 ? ['🥇', '🥈', '🥉'][rank] : rank + 1}
      </span>
      <div className="w-8 h-8 rounded-xl bg-neon-green/10 flex items-center justify-center
                      text-neon-green font-bold text-sm">
        {client.full_name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{client.full_name}</p>
        <p className="text-white/30 text-xs capitalize">{client.fitness_level}</p>
      </div>
      <div className="text-right">
        <p className="text-neon-green text-sm font-bold">{client.streak_days}d streak</p>
        <p className="text-white/30 text-xs">{client.compliance_rate}% comply</p>
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then((r) => r.data),
  });

  const sortedByStreak = [...clients].sort((a, b) => b.streak_days - a.streak_days).slice(0, 8);

  if (isLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner text="Loading performance data..." /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="page-title">Performance Analytics</h1>
        <p className="text-white/40 text-sm">Track coaching effectiveness and client progress metrics.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Streak', value: clients.length ? `${Math.round(clients.reduce((s, c) => s + c.streak_days, 0) / clients.length)}d` : '—', icon: '🔥', color: 'text-orange-400 border-orange-400/20 bg-orange-400/5' },
          { label: 'Avg Compliance', value: clients.length ? `${Math.round(clients.reduce((s, c) => s + c.compliance_rate, 0) / clients.length)}%` : '—', icon: '✅', color: 'text-neon-green border-neon-green/20 bg-neon-green/5' },
          { label: 'Active Rate', value: clients.length ? `${Math.round((clients.filter(c => c.is_active).length / clients.length) * 100)}%` : '—', icon: '⚡', color: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5' },
          { label: 'Total Athletes', value: clients.length, icon: '🏅', color: 'text-purple-400 border-purple-400/20 bg-purple-400/5' },
        ].map(({ label, value, icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className={`glass-card p-4 border ${color}`}>
            <p className="text-3xl mb-1">{icon}</p>
            <p className={`text-2xl font-black ${color.split(' ')[0]}`}>{value}</p>
            <p className="text-white/40 text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Session Completion" icon={Activity}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WEEKLY_SESSIONS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="sessions" fill="rgba(0,180,216,0.5)" name="Assigned" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#00ff87" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Compliance Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={COMPLIANCE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} domain={[60, 100]} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="compliance" stroke="#00ff87" strokeWidth={2.5}
                    dot={{ fill: '#00ff87', r: 5 }} name="Compliance %" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Client Skill Overview" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={SKILL_RADAR}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <Radar name="Avg Score" dataKey="value" stroke="#00ff87" fill="#00ff87" fillOpacity={0.15} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Client Leaderboard" icon={Award}>
          {sortedByStreak.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Add clients to see leaderboard</p>
          ) : (
            <div className="space-y-1">
              {sortedByStreak.map((c, i) => <LeaderboardRow key={c.id} client={c} rank={i} />)}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
