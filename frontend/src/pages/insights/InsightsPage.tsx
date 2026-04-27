import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, Circle, Plus, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/services/api';
import type { Client } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';

const HABIT_CATEGORIES = ['Hydration', 'Sleep', 'Steps', 'Meditation', 'Stretching', 'Protein Intake', 'No Sugar', 'Morning Workout'];

const AI_RECOMMENDATIONS = [
  { icon: '💧', category: 'Hydration', title: 'Increase Water Intake', body: 'Based on training intensity, recommend 3.5L/day pre-workout + 0.5L per hour of exercise.', priority: 'high' },
  { icon: '😴', category: 'Recovery', title: 'Optimize Sleep Protocol', body: 'Data shows clients sleeping 7-9hrs have 23% better compliance. Suggest sleep hygiene habits.', priority: 'high' },
  { icon: '🥩', category: 'Nutrition', title: 'Post-Workout Protein Timing', body: 'Ensure 30-40g protein within 30 min post-workout for optimal muscle protein synthesis.', priority: 'medium' },
  { icon: '🧘', category: 'Mindset', title: 'Add Breathwork Sessions', body: 'HRV data suggests elevated stress markers. 5-min box breathing before sessions can improve performance.', priority: 'medium' },
  { icon: '⚡', category: 'Performance', title: 'Progressive Overload Review', body: 'Clients showing plateau at week 6. Recommend 5% strength increase or exercise variation.', priority: 'low' },
];

interface HabitTracker {
  habit: string;
  completed: boolean[];
}

function HabitsPanel({ client }: { client: Client }) {
  const [habits, setHabits] = useState<HabitTracker[]>(
    HABIT_CATEGORIES.slice(0, 5).map((h) => ({ habit: h, completed: Array(7).fill(false) }))
  );

  const toggle = (habitIdx: number, dayIdx: number) => {
    setHabits((prev) => prev.map((h, i) =>
      i === habitIdx ? { ...h, completed: h.completed.map((c, j) => j === dayIdx ? !c : c) } : h
    ));
  };

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Weekly Habit Tracker</h3>
        <Badge label={`${client.streak_days}d streak`} variant="success" />
      </div>

      <div className="mb-3 flex justify-end gap-2">
        {DAYS.map((d, i) => (
          <div key={i} className="w-8 h-6 flex items-center justify-center text-white/30 text-xs font-bold">{d}</div>
        ))}
      </div>

      <div className="space-y-2">
        {habits.map((h, hi) => (
          <div key={h.habit} className="flex items-center gap-3">
            <span className="text-white/60 text-sm flex-1">{h.habit}</span>
            <div className="flex gap-2">
              {h.completed.map((done, di) => (
                <button key={di} onClick={() => toggle(hi, di)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                          ${done ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-white/5 text-white/20 border border-white/10 hover:border-white/20'}`}>
                  {done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                </button>
              ))}
            </div>
            <span className="text-neon-green text-xs font-bold w-8 text-right">
              {h.completed.filter(Boolean).length}/7
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: typeof AI_RECOMMENDATIONS[0] }) {
  const priorityMap: Record<string, 'error' | 'warning' | 'neutral'> = { high: 'error', medium: 'warning', low: 'neutral' };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card-hover p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{rec.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-semibold text-sm">{rec.title}</p>
            <Badge label={rec.priority} variant={priorityMap[rec.priority]} />
          </div>
          <p className="text-white/40 text-xs leading-relaxed">{rec.body}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-white/25 text-xs">{rec.category}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function InsightsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then((r) => r.data),
  });

  if (isLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner text="Loading insights..." /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="page-title">Insights & Habits</h1>
        <p className="text-white/40 text-sm">AI-powered recommendations and habit tracking for each athlete.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client selector */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5">
            <h3 className="section-title">Select Athlete</h3>
            {clients.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6">No clients yet</p>
            ) : (
              <div className="space-y-2">
                {clients.map((c) => (
                  <motion.button
                    key={c.id}
                    whileHover={{ x: 3 }}
                    onClick={() => setSelectedClient(c)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                      ${selectedClient?.id === c.id
                        ? 'bg-neon-green/10 border border-neon-green/25 text-neon-green'
                        : 'hover:bg-white/5 border border-transparent text-white/70'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm
                      ${selectedClient?.id === c.id ? 'bg-neon-green/20 text-neon-green' : 'bg-white/8 text-white/50'}`}>
                      {c.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.full_name}</p>
                      <p className="text-white/30 text-xs capitalize">{c.fitness_level}</p>
                    </div>
                    {c.streak_days > 0 && (
                      <span className="text-orange-400 text-xs">🔥{c.streak_days}</span>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main panel */}
        <div className="lg:col-span-2 space-y-5">
          <AnimatePresence mode="wait">
            {selectedClient ? (
              <motion.div key={selectedClient.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          className="space-y-5">
                {/* Client header */}
                <div className="glass-card p-4 border border-neon-green/15 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center
                                  text-neon-green text-xl font-black">
                    {selectedClient.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedClient.full_name}</p>
                    <p className="text-white/40 text-sm">{selectedClient.fitness_goal || selectedClient.fitness_level}</p>
                  </div>
                  <div className="ml-auto flex gap-3 text-center">
                    <div><p className="text-neon-green font-bold">{selectedClient.streak_days}</p><p className="text-white/30 text-xs">Streak</p></div>
                    <div><p className="text-neon-green font-bold">{selectedClient.compliance_rate}%</p><p className="text-white/30 text-xs">Comply</p></div>
                  </div>
                </div>

                <HabitsPanel client={selectedClient} />

                {/* AI Recommendations */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-neon-green" />
                    <h3 className="section-title mb-0">AI Recommendations</h3>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green text-xs font-bold border border-neon-green/20">
                      5 insights
                    </span>
                  </div>
                  <div className="space-y-3">
                    {AI_RECOMMENDATIONS.map((rec, i) => (
                      <RecommendationCard key={i} rec={rec} />
                    ))}
                  </div>
                </div>

                {/* Health indicators */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart size={18} className="text-red-400" />
                    <h3 className="section-title mb-0">Health Indicators</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Recovery Score', value: 82, unit: '/100', color: 'neon-green' },
                      { label: 'Stress Level', value: 35, unit: '/100', color: 'orange-400' },
                      { label: 'Sleep Quality', value: 78, unit: '/100', color: 'neon-blue' },
                      { label: 'HRV Score', value: 65, unit: 'ms', color: 'purple-400' },
                    ].map(({ label, value, unit, color }) => (
                      <div key={label} className="bg-white/3 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white/50 text-xs">{label}</p>
                          <span className={`text-${color} text-sm font-bold`}>{value}{unit}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full">
                          <div className={`h-full bg-${color} rounded-full transition-all`}
                               style={{ width: `${unit === '/100' ? value : (value / 100) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-20 glass-card">
                <Brain size={48} className="text-neon-green/30 mb-4" />
                <p className="text-white/40 text-lg font-semibold">Select a client</p>
                <p className="text-white/25 text-sm mt-1">Choose an athlete to view their insights and habits</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
