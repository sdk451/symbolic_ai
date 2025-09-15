import { useState, useEffect, useCallback } from 'react';
import { getDemoRunStatus } from '../services/dashboard';

export interface DemoRunStatus {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  demoId: string;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseDemoExecutionReturn {
  runId: string | null;
  status: DemoRunStatus | null;
  isLoading: boolean;
  error: string | null;
  startDemo: (demoId: string, inputData?: any) => Promise<{ success: boolean; message: string }>;
  refreshStatus: () => Promise<void>;
  clearRun: () => void;
}

export const useDemoExecution = (): UseDemoExecutionReturn => {
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<DemoRunStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!runId) return;

    try {
      const result = await getDemoRunStatus(runId);
      
      if (result.success && result.data) {
        setStatus(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to get status');
      }
    } catch (err) {
      setError('Failed to refresh status');
      console.error('Status refresh error:', err);
    }
  }, [runId]);

  const startDemo = useCallback(async (demoId: string, inputData?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { startDemo: startDemoService } = await import('../services/dashboard');
      const result = await startDemoService(demoId, inputData);
      
      if (result.success && result.runId) {
        setRunId(result.runId);
        setStatus({
          id: result.runId,
          status: 'queued',
          demoId,
          inputData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        setError(result.message || 'Failed to start demo');
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Failed to start demo';
      setError(errorMessage);
      console.error('Demo start error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRun = useCallback(() => {
    setRunId(null);
    setStatus(null);
    setError(null);
  }, []);

  // Poll for status updates when demo is running
  useEffect(() => {
    if (!runId || !status) return;

    // Only poll if demo is still in progress
    if (status.status === 'queued' || status.status === 'running') {
      const interval = setInterval(refreshStatus, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [runId, status?.status, refreshStatus]);

  return {
    runId,
    status,
    isLoading,
    error,
    startDemo,
    refreshStatus,
    clearRun
  };
};
