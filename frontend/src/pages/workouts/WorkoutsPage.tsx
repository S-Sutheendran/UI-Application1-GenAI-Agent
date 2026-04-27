import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Clock, Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workoutsApi, clientsApi } from '@/services/api';
import type { Client, WorkoutPlan } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';

const SAMPLE_PLAN = [
  { day: 'Monday', focus: 'Chest & Triceps', duration_minutes: 60,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', rest_seconds: 90 },
      { name: 'Incline DB Press', sets: 3, reps: '10-12', rest_seconds: 60 },
      { name: 'Cable Flyes', sets: 3, reps: '12-15', rest_seconds: 45 },
      { name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest_seconds: 45 },
    ],
  },
  { day: 'Wednesday', focus: 'Back & Biceps', duration_minutes: 65,
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '5-6', rest_seconds: 120 },
      { name: 'Pull-ups', sets: 3, reps: '8-10', rest_seconds: 90 },
      { name: 'Seated Row', sets: 3, reps: '10-12', rest_seconds: 60 },
      { name: 'Barbell Curl', sets: 3, reps: '10-12', rest_seconds: 45 },
    ],
  },
  { day: 'Friday', focus: 'Legs & Shoulders', duration_minutes: 70,
    exercises: [
      { name: 'Squat', sets: 4, reps: '8-10', rest_seconds: 120 },
      { name: 'Leg Press', sets: 3, reps: '12-15', rest_seconds: 90 },
      { name: 'OHP', sets: 4, reps: '8-10', rest_seconds: 90 },
      { name: 'Lateral Raises', sets: 3, reps: '15-20', rest_seconds: 45 },
    ],
  },
];

function WorkoutCard({ plan, onDelete }: { plan: any; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const totalExercises = plan.plan?.reduce((sum: number, d: any) => sum + (d.exercises?.length || 0), 0);

  return (
    <motion.div layout className="glass-card border border-white/10 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20
                            flex items-center justify-center">
              <Dumbbell size={18} className="text-neon-green" />
            </div>
            <div>
              <h3 className="text-white font-bold">{plan.title}</h3>
              <p className="text-white/40 text-xs">{plan.goal}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(plan.id)} className="w-8 h-8 rounded-lg bg-red-400/10
                                                                   text-red-400 hover:bg-red-400/20 flex items-center justify-center">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Weeks', value: plan.weeks },
            { label: 'Days/wk', value: plan.days_per_week },
            { label: 'Exercises', value: totalExercises || plan.plan?.length * 4 },
            { label: 'Type', value: plan.goal?.slice(0, 6) || 'Mixed' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/3 rounded-xl p-2.5 text-center">
              <p className="text-neon-green font-bold text-sm">{value}</p>
              <p className="text-white/30 text-xs">{label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 mt-4 text-white/40
                     hover:text-white text-xs py-1 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Collapse plan' : 'View workout days'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/8"
          >
            <div className="p-5 space-y-4">
              {(plan.plan || []).map((day: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-neon-green text-xs font-bold">{day.day}</span>
                    <span className="text-white/30 text-xs">— {day.focus}</span>
                    <div className="flex items-center gap-1 ml-auto text-white/30 text-xs">
                      <Clock size={11} /> {day.duration_minutes}min
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {(day.exercises || []).map((ex: any, j: number) => (
                      <div key={j} className="flex items-center gap-3 px-3 py-2 bg-white/3 rounded-lg text-sm">
                        <span className="text-white/80 font-medium flex-1">{ex.name}</span>
                        <span className="text-neon-green text-xs font-mono">{ex.sets}×{ex.reps}</span>
                        <span className="text-white/25 text-xs">{ex.rest_seconds}s rest</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CreatePlanModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ client_id: '', title: '', goal: '', weeks: '4', days_per_week: '3', notes: '' });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then((r) => r.data),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: object) => workoutsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout plan created!');
      onClose();
    },
    onError: () => toast.error('Failed to create plan'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.title) return toast.error('Client and title are required');
    mutate({
      ...form,
      client_id: parseInt(form.client_id),
      weeks: parseInt(form.weeks),
      days_per_week: parseInt(form.days_per_week),
      plan: SAMPLE_PLAN,
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="glass-card w-full max-w-md p-6 border border-white/15">
        <h2 className="text-xl font-bold text-white mb-5">Create Workout Plan</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-white/50 text-xs font-medium block mb-1">Client *</label>
            <select className="input-field" value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Select client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium block mb-1">Plan Title *</label>
            <input className="input-field" placeholder="e.g. 4-Week Strength Program"
                   value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium block mb-1">Goal</label>
            <select className="input-field" value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}>
              <option value="">Select goal</option>
              {['Strength', 'Hypertrophy', 'Fat Loss', 'Endurance', 'Athletic Performance', 'Mobility'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Weeks</label>
              <select className="input-field" value={form.weeks}
                      onChange={(e) => setForm({ ...form, weeks: e.target.value })}>
                {[4, 6, 8, 12, 16].map((w) => <option key={w} value={w}>{w} weeks</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Days/Week</label>
              <select className="input-field" value={form.days_per_week}
                      onChange={(e) => setForm({ ...form, days_per_week: e.target.value })}>
                {[2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="neon-btn-outline flex-1 py-2.5">Cancel</button>
            <button type="submit" disabled={isPending} className="neon-btn flex-1 py-2.5">
              {isPending ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function WorkoutsPage() {
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutsApi.list().then((r) => r.data),
  });

  const { mutate: deletePlan } = useMutation({
    mutationFn: (id: string) => workoutsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workouts'] }); toast.success('Plan deleted'); },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Workout Plans</h1>
          <p className="text-white/40 text-sm">{plans.length} plans created</p>
        </div>
        <button onClick={() => setShowModal(true)} className="neon-btn flex items-center gap-2">
          <Plus size={18} /> New Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner text="Loading plans..." /></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🏋️</p>
          <p className="text-white/40 text-lg font-semibold">No workout plans yet</p>
          <p className="text-white/25 text-sm mt-1">Create your first plan for a client</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan: any) => (
            <WorkoutCard key={plan.id} plan={plan} onDelete={deletePlan} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <CreatePlanModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
