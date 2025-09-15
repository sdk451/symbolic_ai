import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import DemoCard from '../../components/DemoCard';
import { DemoCard as DemoCardType } from '../../services/dashboard';

// Mock the dashboard service
vi.mock('../../services/dashboard', () => ({
  startDemo: vi.fn(),
  getDemoRunStatus: vi.fn()
}));

// Mock the useDemoExecution hook
const mockUseDemoExecution = vi.fn();
vi.mock('../../hooks/useDemoExecution', () => ({
  useDemoExecution: () => mockUseDemoExecution()
}));

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      })
    }
  }
}));

// Mock window.alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('DemoCard with Demo Execution', () => {
  const mockDemo: DemoCardType = {
    id: 'test-demo',
    title: 'Test Demo',
    description: 'This is a test demo description',
    icon: 'Bot',
    color: 'from-blue-500 to-blue-600',
    steps: ['Step 1', 'Step 2', 'Step 3'],
    demoUrl: '#test-demo',
    personaSegments: ['SMB', 'EXEC'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseDemoExecution.mockReturnValue({
      runId: null,
      status: null,
      isLoading: false,
      error: null,
      startDemo: vi.fn(),
      refreshStatus: vi.fn(),
      clearRun: vi.fn()
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders demo card correctly', () => {
    render(<DemoCard demo={mockDemo} />);

    expect(screen.getByText('Test Demo')).toBeDefined();
    expect(screen.getByText('This is a test demo description')).toBeDefined();
    expect(screen.getByText('Demo Steps:')).toBeDefined();
    expect(screen.getByText('Step 1')).toBeDefined();
    expect(screen.getByText('Step 2')).toBeDefined();
    expect(screen.getByText('Step 3')).toBeDefined();
    expect(screen.getByText('Start Demo')).toBeDefined();
    expect(screen.getByText('Interactive Demo')).toBeDefined();
  });

  it('handles demo start successfully', async () => {
    const mockStartDemo = vi.fn().mockResolvedValue({
      success: true,
      message: 'Demo started successfully!'
    });

    mockUseDemoExecution.mockReturnValue({
      runId: null,
      status: null,
      isLoading: false,
      error: null,
      startDemo: mockStartDemo,
      refreshStatus: vi.fn(),
      clearRun: vi.fn()
    });

    render(<DemoCard demo={mockDemo} />);

    const startButton = screen.getByText('Start Demo');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockStartDemo).toHaveBeenCalledWith('test-demo');
    });
  });

  it('shows loading state when starting demo', () => {
    mockUseDemoExecution.mockReturnValue({
      runId: null,
      status: null,
      isLoading: true,
      error: null,
      startDemo: vi.fn(),
      refreshStatus: vi.fn(),
      clearRun: vi.fn()
    });

    render(<DemoCard demo={mockDemo} />);

    const startButton = screen.getByText('Starting...');
    expect(startButton).toBeDefined();
    expect(startButton.disabled).toBe(true);
  });

  it('shows demo status when running', () => {
    mockUseDemoExecution.mockReturnValue({
      runId: 'test-run-id',
      status: {
        id: 'test-run-id',
        status: 'running',
        demoId: 'test-demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      isLoading: false,
      error: null,
      startDemo: vi.fn(),
      refreshStatus: vi.fn(),
      clearRun: vi.fn()
    });

    render(<DemoCard demo={mockDemo} />);

    expect(screen.getByText('Demo is running...')).toBeDefined();
  });

  it('shows success status when demo completes', () => {
    mockUseDemoExecution.mockReturnValue({
      runId: 'test-run-id',
      status: {
        id: 'test-run-id',
        status: 'succeeded',
        demoId: 'test-demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      isLoading: false,
      error: null,
      startDemo: vi.fn(),
      refreshStatus: vi.fn(),
      clearRun: vi.fn()
    });

    render(<DemoCard demo={mockDemo} />);

    expect(screen.getByText('Demo completed successfully!')).toBeDefined();
  });

  it('shows error status when demo fails', () => {
    mockUseDemoExecution.mockReturnValue({
      runId: 'test-run-id',
      status: {
        id: 'test-run-id',
        status: 'failed',
        demoId: 'test-demo',
        errorMessage: 'Demo execution failed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      isLoading: false,
      error: null,
      startDemo: vi.fn(),
      refreshStatus: vi.fn(),
      clearRun: vi.fn()
    });

    render(<DemoCard demo={mockDemo} />);

    expect(screen.getByText('Demo failed: Demo execution failed')).toBeDefined();
  });

  it('shows error message when hook has error', () => {
    mockUseDemoExecution.mockReturnValue({
      runId: null,
      status: null,
      isLoading: false,
      error: 'Failed to start demo',
      startDemo: vi.fn(),
      refreshStatus: vi.fn(),
      clearRun: vi.fn()
    });

    render(<DemoCard demo={mockDemo} />);

    expect(screen.getByText('Failed to start demo')).toBeDefined();
  });

  it('disables button for locked demos', () => {
    const lockedDemo = { ...mockDemo, isLocked: true };
    
    render(<DemoCard demo={lockedDemo} />);

    // Find the button specifically by looking for the disabled button with "Coming Soon" text
    const startButton = screen.getByRole('button', { name: /coming soon/i });
    expect(startButton.disabled).toBe(true);
  });

  it('disables button when loading prop is true', () => {
    render(<DemoCard demo={mockDemo} isLoading={true} />);

    const startButton = screen.getByRole('button', { name: /start demo/i });
    expect(startButton.disabled).toBe(true);
  });

  it('renders different icons correctly', () => {
    const demosWithDifferentIcons = [
      { ...mockDemo, icon: 'MessageCircle', id: 'demo1' },
      { ...mockDemo, icon: 'Calendar', id: 'demo2' },
      { ...mockDemo, icon: 'FileText', id: 'demo3' },
      { ...mockDemo, icon: 'BarChart3', id: 'demo4' },
    ];

    demosWithDifferentIcons.forEach((demo) => {
      const { unmount } = render(<DemoCard demo={demo} />);
      
      // Check that the icon component is rendered (it will show the icon name as text)
      expect(screen.getByText(demo.icon)).toBeDefined();
      
      unmount();
    });
  });
});
