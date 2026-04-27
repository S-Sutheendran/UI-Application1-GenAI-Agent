import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ClientsPage from '@/pages/clients/ClientsPage';
import ClientDetailPage from '@/pages/clients/ClientDetailPage';
import WorkoutsPage from '@/pages/workouts/WorkoutsPage';
import MealsPage from '@/pages/meals/MealsPage';
import PerformancePage from '@/pages/performance/PerformancePage';
import InsightsPage from '@/pages/insights/InsightsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="workouts" element={<WorkoutsPage />} />
            <Route path="meals" element={<MealsPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="insights" element={<InsightsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 10, 26, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 255, 135, 0.2)',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#00ff87', secondary: '#050510' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#050510' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
