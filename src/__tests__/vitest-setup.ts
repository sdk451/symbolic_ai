import { vi } from 'vitest';
import React from 'react';

// Mock Supabase globally to prevent memory issues and auth errors
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })
  }
}));

// Mock useAuth hook globally to prevent Supabase calls
const mockUser = {
  email: 'john@example.com'
};

const mockProfile = {
  full_name: 'John Doe',
  phone: '+1234567890',
  email: 'john@example.com'
};

const mockRefreshProfile = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    profile: mockProfile,
    session: null,
    loading: false,
    isAuthenticated: true,
    isEmailVerified: true,
    refreshProfile: mockRefreshProfile
  }))
}));

// Mock useDemoExecution hook globally
const mockStartDemo = vi.fn().mockResolvedValue({ success: true, runId: 'test-run-id' });
const mockClearRun = vi.fn();

vi.mock('../hooks/useDemoExecution', () => ({
  useDemoExecution: vi.fn(() => ({
    status: null,
    error: null,
    isExecuting: false,
    startDemo: mockStartDemo,
    clearRun: mockClearRun
  }))
}));

// Mock all lucide-react icons
vi.mock('lucide-react', () => ({
  // Dashboard icons
  User: () => React.createElement('div', { 'data-testid': 'user-icon' }),
  Building2: () => React.createElement('div', { 'data-testid': 'building-icon' }),
  Crown: () => React.createElement('div', { 'data-testid': 'crown-icon' }),
  Briefcase: () => React.createElement('div', { 'data-testid': 'briefcase-icon' }),
  GraduationCap: () => React.createElement('div', { 'data-testid': 'graduation-icon' }),
  
  // DemoCard icons
  Play: () => React.createElement('div', { 'data-testid': 'play-icon' }),
  Lock: () => React.createElement('div', { 'data-testid': 'lock-icon' }),
  ArrowRight: () => React.createElement('div', { 'data-testid': 'arrow-right-icon' }),
  Clock: () => React.createElement('div', { 'data-testid': 'clock-icon' }),
  Loader2: () => React.createElement('div', { 'data-testid': 'loader2-icon' }),
  XCircle: () => React.createElement('div', { 'data-testid': 'x-circle-icon' }),
  
  // ActivityFeed icons
  Activity: () => React.createElement('div', { 'data-testid': 'activity-icon' }),
  Calendar: () => React.createElement('div', { 'data-testid': 'calendar-icon' }),
  Eye: () => React.createElement('div', { 'data-testid': 'eye-icon' }),
  CheckCircle: () => React.createElement('div', { 'data-testid': 'check-circle-icon' }),
  AlertCircle: () => React.createElement('div', { 'data-testid': 'alert-circle-icon' }),
  
  // ConsultationCTA icons
  Users: () => React.createElement('div', { 'data-testid': 'users-icon' }),
  Star: () => React.createElement('div', { 'data-testid': 'star-icon' }),
  
  // Service icons
  Bot: () => React.createElement('div', { 'data-testid': 'bot-icon' }),
  MessageCircle: () => React.createElement('div', { 'data-testid': 'message-circle-icon' }),
  FileText: () => React.createElement('div', { 'data-testid': 'file-text-icon' }),
  BarChart3: () => React.createElement('div', { 'data-testid': 'bar-chart-icon' }),
  
  // Modal icons
  X: () => React.createElement('div', { 'data-testid': 'x-icon' }),
  Phone: () => React.createElement('div', { 'data-testid': 'phone-icon' }),
  Mail: () => React.createElement('div', { 'data-testid': 'mail-icon' }),
  MessageSquare: () => React.createElement('div', { 'data-testid': 'message-square-icon' }),
  Send: () => React.createElement('div', { 'data-testid': 'send-icon' }),
  Download: () => React.createElement('div', { 'data-testid': 'download-icon' }),
}));
