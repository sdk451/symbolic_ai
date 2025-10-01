import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeadQualificationModal from '../../components/demo/LeadQualificationModal';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { User, Session } from '@supabase/supabase-js';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn()
  };
});

const mockUseAuth = vi.mocked(useAuth);

const renderWithRouter = (component: React.ReactElement, userData?: any) => {
  // Default mock user data
  const defaultUserData = {
    user: {
      id: '1',
      email: 'john@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z'
    },
    profile: {
      id: '1',
      full_name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      persona_segment: 'SMB' as const,
      onboarding_completed: true,
      organization_name: null,
      organization_size: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: '1',
        email: 'john@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      } as User
    } as Session,
    isAuthenticated: true,
    isEmailVerified: true,
    loading: false,
    refreshProfile: vi.fn()
  };

  // Use provided user data or default
  const authData = userData || defaultUserData;
  mockUseAuth.mockReturnValue(authData);

  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LeadQualificationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCallComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock to return default user data
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'john@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      },
      profile: {
        id: '1',
        full_name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        persona_segment: 'SMB' as const,
        onboarding_completed: true,
        organization_name: null,
        organization_size: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: '1',
          email: 'john@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z'
        } as User
      } as Session,
      isAuthenticated: true,
      isEmailVerified: true,
      loading: false,
      refreshProfile: vi.fn()
    });
  });

  it('renders when open', () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={true}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    expect(screen.getByText('Lead Qualification Demo')).toBeInTheDocument();
    expect(screen.getByText('Fill out the form below and our AI agent will call you to qualify your lead and provide insights.')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={false}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    expect(screen.queryByText('Lead Qualification Demo')).not.toBeInTheDocument();
  });

  it('pre-populates form fields with user profile data', () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={true}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={true}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    // Clear the first name field
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: '' } });

    // Submit the form
    const submitButton = screen.getByText('Submit Lead Qualification Form');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Request description is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={true}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    // Change email to invalid format
    const emailInput = screen.getByDisplayValue('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid' } });

    // Fill out the request field (required for form validation)
    const requestTextarea = screen.getByPlaceholderText('Describe your request or inquiry...');
    fireEvent.change(requestTextarea, { target: { value: 'Test request' } });

    // Submit the form by triggering the form's onSubmit event
    const form = emailInput.closest('form');
    fireEvent.submit(form!);

    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={true}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    // Change phone to invalid format
    const phoneInput = screen.getByDisplayValue('+1234567890');
    fireEvent.change(phoneInput, { target: { value: '123' } });

    // Submit the form
    const submitButton = screen.getByText('Submit Lead Qualification Form');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
    });
  });

  it('validates request description', async () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={true}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    // Add request description
    const requestInput = screen.getByPlaceholderText('Describe your request or inquiry...');
    fireEvent.change(requestInput, { target: { value: 'Test request' } });

    // Submit the form
    const submitButton = screen.getByText('Submit Lead Qualification Form');
    fireEvent.click(submitButton);

    // Should not show validation error for request
    await waitFor(() => {
      expect(screen.queryByText('Request description is required')).not.toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={true}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears errors when user starts typing', async () => {
    renderWithRouter(
      <LeadQualificationModal
        isOpen={true}
        onClose={mockOnClose}
        onCallComplete={mockOnCallComplete}
      />
    );

    // Clear the first name field to trigger validation error
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: '' } });

    // Submit the form
    const submitButton = screen.getByText('Submit Lead Qualification Form');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });

    // Start typing in the name field
    fireEvent.change(firstNameInput, { target: { value: 'J' } });

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
    });
  });
});
