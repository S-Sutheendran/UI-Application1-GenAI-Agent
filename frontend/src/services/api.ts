import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fcp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fcp_token');
      localStorage.removeItem('fcp_coach_id');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  sendOtp: (phone_country_code: string, phone_number: string) =>
    api.post('/auth/send-otp', { phone_country_code, phone_number }),
  verifyOtp: (phone_country_code: string, phone_number: string, otp: string) =>
    api.post('/auth/verify-otp', { phone_country_code, phone_number, otp }),
};

export const coachApi = {
  getMe: () => api.get('/coach/me'),
  updateMe: (data: object) => api.put('/coach/me', data),
  getStats: () => api.get('/coach/me/stats'),
};

export const clientsApi = {
  list: () => api.get('/clients'),
  create: (data: object) => api.post('/clients', data),
  get: (id: number) => api.get(`/clients/${id}`),
  update: (id: number, data: object) => api.put(`/clients/${id}`, data),
  remove: (id: number) => api.delete(`/clients/${id}`),
};

export const workoutsApi = {
  list: () => api.get('/workouts'),
  listByClient: (clientId: number) => api.get(`/workouts/client/${clientId}`),
  create: (data: object) => api.post('/workouts', data),
  get: (id: string) => api.get(`/workouts/${id}`),
  remove: (id: string) => api.delete(`/workouts/${id}`),
};

export const mealsApi = {
  list: () => api.get('/meals'),
  listByClient: (clientId: number) => api.get(`/meals/client/${clientId}`),
  create: (data: object) => api.post('/meals', data),
};

export const insightsApi = {
  get: (clientId: number) => api.get(`/insights/client/${clientId}`),
  upsert: (clientId: number, data: object) => api.put(`/insights/client/${clientId}`, data),
  addProgress: (clientId: number, data: object) =>
    api.post(`/insights/client/${clientId}/progress`, data),
  getProgress: (clientId: number) => api.get(`/insights/client/${clientId}/progress`),
};

export default api;
