import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDemoExecution } from '../../hooks/useDemoExecution';
import * as dashboard from '../../services/dashboard';

// Unmock the useDemoExecution hook for this test file
vi.unmock('../../hooks/useDemoExecution');

// Mock the dashboard service
vi.mock('../../services/dashboard', () => ({
  startDemo: vi.fn(),
  getDemoRunStatus: vi.fn()
}));

// Mock Supabase
const mockGetSession = vi.fn();
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession
    }
  }
}));

describe('useDemoExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful auth session
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token'
        }
      }
    });

    // Mock successful startDemo by default
    vi.mocked(dashboard.startDemo).mockResolvedValue({
      success: true,
      message: 'Demo started successfully',
      runId: 'test-run-id'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDemoExecution());

    expect(result.current.runId).toBeNull();
    expect(result.current.status).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should start a demo successfully', async () => {
    // Mock successful demo start
    const mockStartDemo = vi.fn().mockResolvedValue({
      success: true,
      message: 'Demo started successfully',
      runId: 'test-run-id'
    });

    // Mock the startDemo function
    vi.mocked(dashboard.startDemo).mockImplementation(mockStartDemo);

    const { result } = renderHook(() => useDemoExecution());

    await act(async () => {
      const response = await result.current.startDemo('test-demo', { test: 'data' });
      expect(response.success).toBe(true);
    });

    expect(result.current.runId).toBe('test-run-id');
    expect(result.current.status).toEqual({
      id: 'test-run-id',
      status: 'queued',
      demoId: 'test-demo',
      inputData: { test: 'data' },
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle demo start failure', async () => {
    const mockStartDemo = vi.fn().mockResolvedValue({
      success: false,
      message: 'Demo failed to start'
    });

    vi.mocked(dashboard.startDemo).mockImplementation(mockStartDemo);

    const { result } = renderHook(() => useDemoExecution());

    await act(async () => {
      const response = await result.current.startDemo('test-demo');
      expect(response.success).toBe(false);
    });

    expect(result.current.runId).toBeNull();
    expect(result.current.status).toBeNull();
    expect(result.current.error).toBe('Demo failed to start');
  });

  it('should refresh status successfully', async () => {
    const mockStatus = {
      id: 'test-run-id',
      status: 'running',
      demoId: 'test-demo',
      inputData: { test: 'data' },
      outputData: null,
      errorMessage: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockGetStatus = vi.fn().mockResolvedValue({
      success: true,
      data: mockStatus
    });

    vi.mocked(dashboard.getDemoRunStatus).mockImplementation(mockGetStatus);

    const { result } = renderHook(() => useDemoExecution());

    // Set a runId first by starting a demo
    await act(async () => {
      await result.current.startDemo('test-demo', { test: 'data' });
    });

    // Now refresh status
    await act(async () => {
      await result.current.refreshStatus();
    });

    expect(result.current.status).toEqual(mockStatus);
    expect(result.current.error).toBeNull();
  });

  it('should handle status refresh failure', async () => {
    const mockGetStatus = vi.fn().mockResolvedValue({
      success: false,
      message: 'Failed to get status'
    });

    vi.mocked(dashboard.getDemoRunStatus).mockImplementation(mockGetStatus);

    const { result } = renderHook(() => useDemoExecution());

    // Set a runId first by starting a demo
    await act(async () => {
      await result.current.startDemo('test-demo');
    });

    await act(async () => {
      await result.current.refreshStatus();
    });

    expect(result.current.error).toBe('Failed to get status');
  });

  it('should clear run data', async () => {
    const { result } = renderHook(() => useDemoExecution());

    // Set some data first by starting a demo
    await act(async () => {
      await result.current.startDemo('test-demo');
    });

    // Clear the data
    act(() => {
      result.current.clearRun();
    });

    expect(result.current.runId).toBeNull();
    expect(result.current.status).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should poll for status updates when demo is running', async () => {
    const mockStatus = {
      id: 'test-run-id',
      status: 'running',
      demoId: 'test-demo',
      inputData: { test: 'data' },
      outputData: null,
      errorMessage: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockGetStatus = vi.fn()
      .mockResolvedValueOnce({
        success: true,
        data: mockStatus
      })
      .mockResolvedValueOnce({
        success: true,
        data: { ...mockStatus, status: 'succeeded' }
      });

    vi.mocked(dashboard.getDemoRunStatus).mockImplementation(mockGetStatus);

    const { result } = renderHook(() => useDemoExecution());

    // Start a demo to set up the polling
    await act(async () => {
      await result.current.startDemo('test-demo', { test: 'data' });
    });

    // Wait for polling to occur (the hook polls every 2 seconds)
    await waitFor(() => {
      expect(mockGetStatus).toHaveBeenCalled();
    }, { timeout: 3000 });

    // The hook should have called getDemoRunStatus due to polling
    expect(mockGetStatus).toHaveBeenCalledWith('test-run-id');
  });
});
