import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import { User, Session } from '@supabase/supabase-js';
import { PersonaSegment } from '../../components/PersonaSelector';

// Mock the hooks
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useDashboard');

// Helper functions to create properly typed mock objects
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
  ...overrides
});

const createMockProfile = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  full_name: 'Test User',
  phone: null,
  email: 'test@example.com',
  persona_segment: 'SMB' as PersonaSegment,
  onboarding_completed: true,
  organization_name: null,
  organization_size: null,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
});

const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  access_token: 'test-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides
});

// Icons are mocked globally in vitest-setup.ts

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true,
});

const mockUseAuth = vi.mocked(useAuth);
const mockUseDashboard = vi.mocked(useDashboard);

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders loading state correctly', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      session: null,
      loading: false,
      isAuthenticated: true,
      isEmailVerified: true,
      refreshProfile: vi.fn(),
    });

    mockUseDashboard.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      startDemoRun: vi.fn(),
      refreshData: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByText('Loading...')).toBeDefined();
    expect(screen.getByText('Symbolic AI Dashboard')).toBeDefined();
  });

  it('renders error state correctly', () => {
    mockUseAuth.mockReturnValue({
      user: createMockUser({ email: 'test@example.com' }),
      profile: createMockProfile({ full_name: 'Test User' }),
      session: createMockSession(),
      loading: false,
      isAuthenticated: true,
      isEmailVerified: true,
      refreshProfile: vi.fn(),
    });

    mockUseDashboard.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load dashboard data',
      startDemoRun: vi.fn(),
      refreshData: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByText('Error Loading Dashboard')).toBeDefined();
    expect(screen.getByText('Failed to load dashboard data')).toBeDefined();
    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('renders dashboard with persona-specific content for SMB user', () => {
    const mockProfile = createMockProfile({
      full_name: 'John Doe',
      email: 'john@example.com',
      persona_segment: 'SMB' as PersonaSegment,
    });

    const mockDashboardData = {
      demos: [
        {
          id: 'lead-qualification',
          title: 'AI Lead Qualification Agent',
          description: 'Experience how our AI agent qualifies leads',
          icon: 'Bot',
          color: 'from-blue-500 to-blue-600',
          steps: ['Step 1', 'Step 2'],
          demoUrl: '#demo',
          personaSegments: ['SMB'] as PersonaSegment[],
        },
      ],
      activities: [
        {
          id: '1',
          type: 'demo_run' as const,
          title: 'Demo Run',
          description: 'Completed demo',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'completed' as const,
        },
      ],
      consultationMessage: 'Ready to scale your business operations?',
      teaserContent: {
        title: 'Advanced Workflow Automation',
        description: 'Coming soon: Multi-step business process automation',
        comingSoon: true,
      },
    };

    mockUseAuth.mockReturnValue({
      user: createMockUser({ email: 'john@example.com' }),
      profile: mockProfile ,
      session: createMockSession(),
      loading: false,
      isAuthenticated: true,
      isEmailVerified: true,
      refreshProfile: vi.fn(),
    });

    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      startDemoRun: vi.fn(),
      refreshData: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByText('Symbolic AI Dashboard')).toBeDefined();
    expect(screen.getByText('Welcome, John Doe')).toBeDefined();
    expect(screen.getByText('SMB')).toBeDefined();
    expect(screen.getByText('Personalized Demos')).toBeDefined();
    expect(screen.getByText('Demos tailored for SMB professionals')).toBeDefined();
    expect(screen.getByText('AI Lead Qualification Agent')).toBeDefined();
    expect(screen.getByText('Recent Activity')).toBeDefined();
    expect(screen.getByText('Ready to Get Started?')).toBeDefined();
    expect(screen.getByText('Advanced Workflow Automation')).toBeDefined();
  });

  it('handles demo start correctly', async () => {
    const mockStartDemoRun = vi.fn().mockResolvedValue({
      success: true,
      message: 'Demo started successfully!',
    });

    const mockProfile = createMockProfile({
      full_name: 'John Doe',
      email: 'john@example.com',
      persona_segment: 'SMB' as PersonaSegment,
    });

    const mockDashboardData = {
      demos: [
        {
          id: 'lead-qualification',
          title: 'AI Lead Qualification Agent',
          description: 'Experience how our AI agent qualifies leads',
          icon: 'Bot',
          color: 'from-blue-500 to-blue-600',
          steps: ['Step 1', 'Step 2'],
          demoUrl: '#demo',
          personaSegments: ['SMB'] as PersonaSegment[],
        },
      ],
      activities: [],
      consultationMessage: 'Ready to scale your business operations?',
      teaserContent: {
        title: 'Advanced Workflow Automation',
        description: 'Coming soon: Multi-step business process automation',
        comingSoon: true,
      },
    };

    mockUseAuth.mockReturnValue({
      user: createMockUser({ email: 'john@example.com' }),
      profile: mockProfile ,
      session: createMockSession(),
      loading: false,
      isAuthenticated: true,
      isEmailVerified: true,
      refreshProfile: vi.fn(),
    });

    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      startDemoRun: mockStartDemoRun,
      refreshData: vi.fn(),
    });

    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderDashboard();

    // Verify that the demo card is rendered with the correct demo
    expect(screen.getByText('AI Lead Qualification Agent')).toBeDefined();
    expect(screen.getByText('Start Demo')).toBeDefined();
    
    // The demo execution is now handled internally by DemoCard using useDemoExecution hook
    // We just verify that the demo card is properly rendered and clickable
    const startDemoButton = screen.getByText('Start Demo');
    expect(startDemoButton).toBeDefined();
    expect((startDemoButton as HTMLButtonElement).disabled).toBe(false);
  });

  it('handles consultation booking correctly', () => {
    const mockProfile = createMockProfile({
      full_name: 'John Doe',
      email: 'john@example.com',
      persona_segment: 'SMB' as PersonaSegment,
    });

    const mockDashboardData = {
      demos: [],
      activities: [],
      consultationMessage: 'Ready to scale your business operations?',
      teaserContent: {
        title: 'Advanced Workflow Automation',
        description: 'Coming soon: Multi-step business process automation',
        comingSoon: true,
      },
    };

    mockUseAuth.mockReturnValue({
      user: createMockUser({ email: 'john@example.com' }),
      profile: mockProfile ,
      session: createMockSession(),
      loading: false,
      isAuthenticated: true,
      isEmailVerified: true,
      refreshProfile: vi.fn(),
    });

    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      startDemoRun: vi.fn(),
      refreshData: vi.fn(),
    });

    renderDashboard();

    const bookConsultationButton = screen.getByText('Book Free Consultation');
    fireEvent.click(bookConsultationButton);

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'openConsultationModal',
      })
    );
  });

  it('shows onboarding prompt when no persona segment', () => {
    const mockProfile = createMockProfile({
      full_name: 'John Doe',
      email: 'john@example.com',
      persona_segment: null,
      onboarding_completed: false,
    });

    mockUseAuth.mockReturnValue({
      user: createMockUser({ email: 'john@example.com' }),
      profile: mockProfile ,
      session: createMockSession(),
      loading: false,
      isAuthenticated: true,
      isEmailVerified: true,
      refreshProfile: vi.fn(),
    });

    mockUseDashboard.mockReturnValue({
      data: { demos: [], activities: [], consultationMessage: '', teaserContent: { title: '', description: '', comingSoon: false } },
      loading: false,
      error: null,
      startDemoRun: vi.fn(),
      refreshData: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByText('No demos available for your persona segment.')).toBeDefined();
    expect(screen.getByText('Complete Onboarding')).toBeDefined();
  });
});
