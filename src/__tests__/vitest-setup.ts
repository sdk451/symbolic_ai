import { vi } from 'vitest';
import React from 'react';

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
}));
