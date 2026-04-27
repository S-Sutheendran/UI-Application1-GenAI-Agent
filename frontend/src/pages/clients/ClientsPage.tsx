import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Filter, ChevronRight, Flame, Target } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clientsApi } from '@/services/api';
import type { Client } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';

const LEVELS = ['All', 'beginner', 'intermediate', 'advanced', 'elite'];

function AddClientModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', gender: '',
    fitness_goal: '', fitness_level: 'beginner',
    height_cm: '', weight_kg: '',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: object) => clientsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client added successfully!');
      onClose();
    },
    onError: () => toast.error('Failed to add client'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name) return toast.error('Name is required');
    mutate({
      ...form,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-lg p-6 border border-white/15"
        data-testid="add-client-modal"
      >
        <h2 className="text-xl font-bold text-white mb-5">Add New Client</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-white/50 text-xs font-medium block mb-1">Full Name *</label>
              <input className="input-field" placeholder="John Doe" value={form.full_name}
                     onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Email</label>
              <input className="input-field" type="email" placeholder="john@example.com"
                     value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Phone</label>
              <input className="input-field" placeholder="+1234567890"
                     value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Height (cm)</label>
              <input className="input-field" type="number" placeholder="175"
                     value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Weight (kg)</label>
              <input className="input-field" type="number" placeholder="75"
                     value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Gender</label>
              <select className="input-field" value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium block mb-1">Fitness Level</label>
              <select className="input-field" value={form.fitness_level}
                      onChange={(e) => setForm({ ...form, fitness_level: e.target.value })}>
                {['beginner', 'intermediate', 'advanced', 'elite'].map((l) => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-white/50 text-xs font-medium block mb-1">Fitness Goal</label>
              <input className="input-field" placeholder="e.g. Lose 10kg, Build muscle, Marathon prep"
                     value={form.fitness_goal} onChange={(e) => setForm({ ...form, fitness_goal: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="neon-btn-outline flex-1 py-2.5">Cancel</button>
            <button type="submit" disabled={isPending} className="neon-btn flex-1 py-2.5">
              {isPending ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const navigate = useNavigate();
  const bmi = client.height_cm && client.weight_kg
    ? (client.weight_kg / Math.pow(client.height_cm / 100, 2)).toFixed(1)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/clients/${client.id}`)}
      className="glass-card-hover p-5 cursor-pointer"
      data-testid={`client-card-${client.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-neon-green/10 border border-neon-green/20
                          flex items-center justify-center text-neon-green font-bold text-lg">
            {client.full_name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-bold">{client.full_name}</p>
            <p className="text-white/40 text-xs capitalize">{client.fitness_level}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-white/25 group-hover:text-neon-green transition-colors mt-1" />
      </div>

      {client.fitness_goal && (
        <div className="flex items-center gap-1.5 mb-3">
          <Target size={12} className="text-neon-blue" />
          <p className="text-white/50 text-xs truncate">{client.fitness_goal}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        {[
          { label: 'Streak', value: `${client.streak_days}d` },
          { label: 'Comply', value: `${client.compliance_rate}%` },
          { label: 'BMI', value: bmi || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/3 rounded-lg py-2">
            <p className="text-neon-green text-sm font-bold">{value}</p>
            <p className="text-white/30 text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Badge label={client.is_active ? 'Active' : 'Inactive'} variant={client.is_active ? 'success' : 'neutral'} />
        {client.streak_days >= 7 && (
          <div className="flex items-center gap-1">
            <Flame size={13} className="text-orange-400" />
            <span className="text-orange-400 text-xs font-semibold">On Fire!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ClientsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then((r) => r.data),
  });

  const filtered = clients.filter((c) => {
    const matchSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        c.email?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'All' || c.fitness_level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-white/40 text-sm">{clients.length} total athletes in your roster</p>
        </div>
        <button onClick={() => setShowModal(true)} data-testid="add-client-btn"
                className="neon-btn flex items-center gap-2">
          <UserPlus size={18} /> Add Client
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input-field pl-10"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="client-search"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((l) => (
            <button key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all
                ${levelFilter === l
                  ? 'bg-neon-green/15 text-neon-green border-neon-green/30'
                  : 'bg-white/5 text-white/40 border-white/10 hover:text-white'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner text="Loading clients..." /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-white/40 text-lg font-semibold">No clients found</p>
          <p className="text-white/25 text-sm mt-1">Add your first client to get started</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((c) => <ClientCard key={c.id} client={c} />)}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && <AddClientModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
