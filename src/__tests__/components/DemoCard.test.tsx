import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import DemoCard from '../../components/DemoCard';
import { DemoCard as DemoCardType } from '../../services/dashboard';

// Icons are mocked globally in vitest-setup.ts

// Mock window.alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('DemoCard', () => {
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

  const mockOnStartDemo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders demo card correctly', () => {
    render(
      <DemoCard 
        demo={mockDemo} 
        onStartDemo={mockOnStartDemo} 
      />
    );

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
    mockOnStartDemo.mockResolvedValue({
      success: true,
      message: 'Demo started successfully!',
    });

    render(
      <DemoCard 
        demo={mockDemo} 
        onStartDemo={mockOnStartDemo} 
      />
    );

    const startButton = screen.getByText('Start Demo');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnStartDemo).toHaveBeenCalledWith('test-demo');
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Demo started successfully!');
    });
  });

  it('handles demo start failure', async () => {
    mockOnStartDemo.mockResolvedValue({
      success: false,
      message: 'Demo failed to start',
    });

    render(
      <DemoCard 
        demo={mockDemo} 
        onStartDemo={mockOnStartDemo} 
      />
    );

    const startButton = screen.getByText('Start Demo');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnStartDemo).toHaveBeenCalledWith('test-demo');
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Demo failed to start');
    });
  });

  it('handles demo start error', async () => {
    mockOnStartDemo.mockRejectedValue(new Error('Network error'));

    render(
      <DemoCard 
        demo={mockDemo} 
        onStartDemo={mockOnStartDemo} 
      />
    );

    const startButton = screen.getByText('Start Demo');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnStartDemo).toHaveBeenCalledWith('test-demo');
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to start demo. Please try again.');
    });
  });

  it('renders locked demo correctly', () => {
    const lockedDemo: DemoCardType = {
      ...mockDemo,
      isLocked: true,
      teaserText: 'Coming Soon - Advanced Feature',
    };

    render(
      <DemoCard 
        demo={lockedDemo} 
        onStartDemo={mockOnStartDemo} 
      />
    );

    expect(screen.getByText('Coming Soon - Advanced Feature')).toBeDefined();
    
    const button = screen.getByRole('button', { name: /coming soon/i });
    expect(button.disabled).toBe(true);
  });

  it('shows loading state when starting demo', async () => {
    mockOnStartDemo.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <DemoCard 
        demo={mockDemo} 
        onStartDemo={mockOnStartDemo} 
      />
    );

    const startButton = screen.getByRole('button', { name: /start demo/i });
    fireEvent.click(startButton);

    expect(screen.getByText('Starting...')).toBeDefined();
    expect(startButton.disabled).toBe(true);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start demo/i })).toBeDefined();
    });
  });

  it('disables button when loading prop is true', () => {
    render(
      <DemoCard 
        demo={mockDemo} 
        onStartDemo={mockOnStartDemo} 
        isLoading={true}
      />
    );

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
      const { unmount } = render(
        <DemoCard 
          demo={demo} 
          onStartDemo={mockOnStartDemo} 
        />
      );
      
      expect(screen.getByText('Test Demo')).toBeDefined();
      unmount();
    });
  });
});
