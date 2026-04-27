import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Plus, Zap, Beef, Wheat, Droplets } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { mealsApi, clientsApi } from '@/services/api';
import type { Client } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const MACRO_TEMPLATES = [
  { name: 'Fat Loss', cal: 1800, protein: 160, carbs: 150, fat: 55 },
  { name: 'Muscle Gain', cal: 3000, protein: 200, carbs: 350, fat: 80 },
  { name: 'Maintenance', cal: 2300, protein: 150, carbs: 260, fat: 70 },
  { name: 'Keto', cal: 2000, protein: 160, carbs: 40, fat: 145 },
];

function MacroRing({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  const pP = ((protein * 4) / total) * 100;
  const pC = ((carbs * 4) / total) * 100;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00ff87" strokeWidth="3"
                  strokeDasharray={`${pP} ${100 - pP}`} strokeLinecap="round" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00b4d8" strokeWidth="3"
                  strokeDasharray={`${pC} ${100 - pC}`} strokeDashoffset={`-${pP}`} strokeLinecap="round" />
        </svg>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-green" /><span className="text-white/60">Protein {protein}g</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-blue" /><span className="text-white/60">Carbs {carbs}g</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-white/60">Fat {fat}g</span></div>
      </div>
    </div>
  );
}

function MealPlanCard({ plan }: { plan: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 border border-white/10 hover:border-purple-400/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <Utensils size={18} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">{plan.title}</h3>
            <p className="text-white/40 text-xs">{plan.goal} · {plan.weeks} weeks</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-neon-green">{plan.daily_calorie_target}</p>
          <p className="text-white/30 text-xs">kcal/day</p>
        </div>
      </div>
      <MacroRing protein={plan.protein_target_g} carbs={plan.carbs_target_g} fat={plan.fat_target_g} />
      {plan.dietary_restrictions?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {plan.dietary_restrictions.map((r: string) => (
            <span key={r} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">{r}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CreateMealModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    client_id: '', title: '', goal: '', weeks: '4',
    daily_calorie_target: '2000', protein_target_g: '150',
    carbs_target_g: '200', fat_target_g: '70',
    dietary_restrictions: [] as string[],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then((r) => r.data),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: object) => mealsApi.create(data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meals'] }); toast.success('Meal plan created!'); onClose(); },
    onError: () => toast.error('Failed to create meal plan'),
  });

  const applyTemplate = (t: typeof MACRO_TEMPLATES[0]) => {
    setForm(f => ({ ...f, goal: t.name, daily_calorie_target: String(t.cal),
      protein_target_g: String(t.protein), carbs_target_g: String(t.carbs), fat_target_g: String(t.fat) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.title) return toast.error('Client and title required');
    mutate({
      ...form, client_id: parseInt(form.client_id), weeks: parseInt(form.weeks),
      daily_calorie_target: parseInt(form.daily_calorie_target),
      protein_target_g: parseFloat(form.protein_target_g),
      carbs_target_g: parseFloat(form.carbs_target_g),
      fat_target_g: parseFloat(form.fat_target_g),
      plan: [],
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="glass-card w-full max-w-lg p-6 border border-white/15 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-5">Create Meal Plan</h2>

        {/* Quick templates */}
        <div className="mb-5">
          <p className="text-white/50 text-xs font-medium mb-2">Quick Templates</p>
          <div className="grid grid-cols-2 gap-2">
            {MACRO_TEMPLATES.map((t) => (
              <button key={t.name} type="button" onClick={() => applyTemplate(t)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left
                                 hover:border-neon-green/30 hover:bg-neon-green/5 transition-all">
                <p className="text-white text-xs font-semibold">{t.name}</p>
                <p className="text-white/30 text-xs">{t.cal} kcal</p>
              </button>
            ))}
          </div>
        </div>

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
            <input className="input-field" placeholder="e.g. 4-Week Fat Loss Diet"
                   value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Daily Calories</label>
              <input className="input-field" type="number" value={form.daily_calorie_target}
                     onChange={(e) => setForm({ ...form, daily_calorie_target: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Weeks</label>
              <select className="input-field" value={form.weeks}
                      onChange={(e) => setForm({ ...form, weeks: e.target.value })}>
                {[4, 6, 8, 12].map((w) => <option key={w} value={w}>{w} weeks</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium flex items-center gap-1 mb-1">
                <Beef size={12} className="text-neon-green" /> Protein (g)
              </label>
              <input className="input-field" type="number" value={form.protein_target_g}
                     onChange={(e) => setForm({ ...form, protein_target_g: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium flex items-center gap-1 mb-1">
                <Wheat size={12} className="text-neon-blue" /> Carbs (g)
              </label>
              <input className="input-field" type="number" value={form.carbs_target_g}
                     onChange={(e) => setForm({ ...form, carbs_target_g: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium flex items-center gap-1 mb-1">
                <Droplets size={12} className="text-orange-400" /> Fat (g)
              </label>
              <input className="input-field" type="number" value={form.fat_target_g}
                     onChange={(e) => setForm({ ...form, fat_target_g: e.target.value })} />
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

export default function MealsPage() {
  const [showModal, setShowModal] = useState(false);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['meals'],
    queryFn: () => mealsApi.list().then((r) => r.data),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Meal Plans</h1>
          <p className="text-white/40 text-sm">{plans.length} nutrition plans created</p>
        </div>
        <button onClick={() => setShowModal(true)} className="neon-btn flex items-center gap-2">
          <Plus size={18} /> New Meal Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner text="Loading meal plans..." /></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🥗</p>
          <p className="text-white/40 text-lg font-semibold">No meal plans yet</p>
          <p className="text-white/25 text-sm mt-1">Create customized nutrition plans for your clients</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p: any) => <MealPlanCard key={p.id} plan={p} />)}
        </div>
      )}

      <AnimatePresence>
        {showModal && <CreateMealModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
