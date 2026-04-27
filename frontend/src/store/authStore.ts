import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      coachId: null,
      isAuthenticated: false,
      login: (token: string, coachId: number) => {
        localStorage.setItem('fcp_token', token);
        localStorage.setItem('fcp_coach_id', String(coachId));
        set({ token, coachId, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('fcp_token');
        localStorage.removeItem('fcp_coach_id');
        set({ token: null, coachId: null, isAuthenticated: false });
      },
    }),
    { name: 'fcp-auth' }
  )
);
