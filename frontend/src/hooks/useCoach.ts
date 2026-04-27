import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coachApi } from '@/services/api';
import type { Coach, CoachStats } from '@/types';

export function useCoach() {
  const { data: coach, isLoading } = useQuery<Coach>({
    queryKey: ['coach', 'me'],
    queryFn: () => coachApi.getMe().then((r) => r.data),
  });

  return { coach, isLoading };
}

export function useCoachStats() {
  const { data: stats, isLoading } = useQuery<CoachStats>({
    queryKey: ['coach', 'stats'],
    queryFn: () => coachApi.getStats().then((r) => r.data),
  });
  return { stats, isLoading };
}

export function useUpdateCoach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Coach>) => coachApi.updateMe(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coach'] }),
  });
}
