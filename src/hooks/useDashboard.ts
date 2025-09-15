import { useState, useEffect, useCallback } from 'react';
import { PersonaSegment } from '../components/PersonaSelector';
import { 
  DashboardData, 
  fetchDashboardData, 
  startDemo
} from '../services/dashboard';

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  startDemoRun: (demoId: string) => Promise<{ success: boolean; message: string }>;
  refreshData: () => Promise<void>;
}

export const useDashboard = (personaSegment: PersonaSegment | null): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await fetchDashboardData(personaSegment);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [personaSegment]);

  const startDemoRun = async (demoId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await startDemo(demoId);
      
      if (result.success) {
        // Refresh activities to show the new demo run
        await loadDashboardData();
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to start demo'
      };
    }
  };

  const refreshData = async () => {
    await loadDashboardData();
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    data,
    loading,
    error,
    startDemoRun,
    refreshData
  };
};
