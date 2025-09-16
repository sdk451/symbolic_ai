import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PersonaSelector, { PersonaSegment } from '../../components/PersonaSelector';
import { authService } from '../../services/auth';

const OnboardingPage: React.FC = () => {
  const { user, profile, isEmailVerified, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect logic
  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    // If not authenticated, redirect to home
    if (!user) {
      navigate('/');
      return;
    }

    // If email not verified, redirect to home with message
    if (!isEmailVerified) {
      navigate('/', { 
        state: { 
          message: 'Please verify your email before completing onboarding' 
        } 
      });
      return;
    }

    // If already completed onboarding, redirect to main route (which shows dashboard)
    if (profile?.onboarding_completed) {
      navigate('/');
      return;
    }
  }, [user, profile, isEmailVerified, loading, navigate]);

  const handlePersonaSelect = async (
    persona: PersonaSegment, 
    organizationName?: string, 
    organizationSize?: string
  ) => {
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🎯 Onboarding: Completing persona selection', {
        persona,
        organizationName,
        organizationSize
      });

      await authService.completeOnboarding({
        personaSegment: persona,
        organizationName,
        organizationSize
      });

      console.log('🎯 Onboarding: Persona selection completed successfully');
      
      // Refresh the profile data to ensure the latest state is loaded
      await refreshProfile();
      
      console.log('🎯 Onboarding: Profile refreshed, navigating to dashboard');
      
      // Redirect to main route - it will automatically show the dashboard
      // when the user is authenticated, email verified, and onboarding completed
      navigate('/', {
        state: { 
          message: 'Welcome! Your onboarding is complete.' 
        }
      });
    } catch (error) {
      console.error('🎯 Onboarding: Error completing onboarding', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if redirecting
  if (!user || !isEmailVerified || profile?.onboarding_completed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-orange-500/20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-500">
                Symbolic AI
              </h1>
            </div>
            <div className="text-sm text-gray-400">
              Welcome, {profile?.full_name || user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <PersonaSelector
          onSelect={handlePersonaSelect}
          isLoading={isSubmitting}
          error={error}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-orange-500/20 bg-[#1a1a1a] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>Need help? Contact our support team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
