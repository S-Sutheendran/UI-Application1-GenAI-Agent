import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Dumbbell, Utensils, BarChart3, Brain, Phone, Mail, Flame, Target } from 'lucide-react';
import { clientsApi, workoutsApi, mealsApi, insightsApi } from '@/services/api';
import type { Client, WorkoutPlan, MealPlan } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_PROGRESS = [
  { date: 'W1', weight: 82, bodyFat: 22, muscle: 38 },
  { date: 'W2', weight: 81, bodyFat: 21.5, muscle: 38.2 },
  { date: 'W3', weight: 80.2, bodyFat: 21, muscle: 38.5 },
  { date: 'W4', weight: 79.8, bodyFat: 20.5, muscle: 39 },
  { date: 'W5', weight: 79, bodyFat: 20, muscle: 39.4 },
  { date: 'W6', weight: 78.5, bodyFat: 19.8, muscle: 39.8 },
];

function ProgressChart() {
  return (
    <div className="glass-card p-5">
      <h3 className="section-title">Progress Overview</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={MOCK_PROGRESS}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#0a0a1a', border: '1px solid rgba(0,255,135,0.2)', borderRadius: '12px', color: '#fff' }}
          />
          <Line type="monotone" dataKey="weight" stroke="#00ff87" strokeWidth={2} dot={{ fill: '#00ff87', r: 4 }} name="Weight (kg)" />
          <Line type="monotone" dataKey="bodyFat" stroke="#00b4d8" strokeWidth={2} dot={{ fill: '#00b4d8', r: 4 }} name="Body Fat %" />
          <Line type="monotone" dataKey="muscle" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} name="Muscle (kg)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = parseInt(id!);

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ['clients', clientId],
    queryFn: () => clientsApi.get(clientId).then((r) => r.data),
  });

  const { data: workouts = [] } = useQuery<WorkoutPlan[]>({
    queryKey: ['workouts', clientId],
    queryFn: () => workoutsApi.listByClient(clientId).then((r) => r.data),
    enabled: !!clientId,
  });

  const { data: mealPlans = [] } = useQuery<MealPlan[]>({
    queryKey: ['meals', clientId],
    queryFn: () => mealsApi.listByClient(clientId).then((r) => r.data),
    enabled: !!clientId,
  });

  if (isLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner text="Loading client..." /></div>;
  }

  if (!client) {
    return <div className="text-center py-16 text-white/40">Client not found</div>;
  }

  const bmi = client.height_cm && client.weight_kg
    ? (client.weight_kg / Math.pow(client.height_cm / 100, 2)).toFixed(1) : '—';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Clients
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 border border-neon-green/10">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="w-20 h-20 rounded-2xl bg-neon-green/10 border-2 border-neon-green/25
                          flex items-center justify-center text-3xl font-black text-neon-green">
            {client.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-black text-white">{client.full_name}</h1>
              <Badge label={client.is_active ? 'Active' : 'Inactive'} variant={client.is_active ? 'success' : 'neutral'} />
              <Badge label={client.fitness_level} variant="info" />
            </div>
            {client.fitness_goal && (
              <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                <Target size={13} className="text-neon-blue" /> {client.fitness_goal}
              </div>
            )}
            <div className="flex gap-4 text-sm text-white/40 flex-wrap">
              {client.email && <span className="flex items-center gap-1"><Mail size={13} />{client.email}</span>}
              {client.phone && <span className="flex items-center gap-1"><Phone size={13} />{client.phone}</span>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'Streak', value: `${client.streak_days}d`, icon: Flame, color: 'text-orange-400' },
              { label: 'Comply', value: `${client.compliance_rate}%`, icon: BarChart3, color: 'text-neon-green' },
              { label: 'BMI', value: bmi, icon: Target, color: 'text-neon-blue' },
              { label: 'Weight', value: client.weight_kg ? `${client.weight_kg}kg` : '—', icon: BarChart3, color: 'text-purple-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2.5">
                <Icon size={14} className={`${color} mx-auto mb-1`} />
                <p className={`text-base font-bold ${color}`}>{value}</p>
                <p className="text-white/30 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Progress chart */}
      <ProgressChart />

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={18} className="text-neon-green" />
            <h3 className="section-title mb-0">Workout Plans ({workouts.length})</h3>
          </div>
          {workouts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/30 text-sm">No workout plans yet</p>
              <button onClick={() => navigate('/workouts')} className="neon-btn-outline mt-3 text-xs px-3 py-2">
                Create Plan
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {workouts.map((w: any) => (
                <div key={w.id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
                    <Dumbbell size={14} className="text-neon-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{w.title}</p>
                    <p className="text-white/30 text-xs">{w.weeks} weeks · {w.days_per_week}x/week</p>
                  </div>
                  <Badge label={w.goal} variant="info" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Utensils size={18} className="text-purple-400" />
            <h3 className="section-title mb-0">Meal Plans ({mealPlans.length})</h3>
          </div>
          {mealPlans.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/30 text-sm">No meal plans yet</p>
              <button onClick={() => navigate('/meals')} className="neon-btn-outline mt-3 text-xs px-3 py-2">
                Create Plan
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {mealPlans.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
                    <Utensils size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{m.title}</p>
                    <p className="text-white/30 text-xs">{m.daily_calorie_target} kcal/day</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
