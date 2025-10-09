import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Approach from './components/Approach';
import Services from './components/Services';
import Advisory from './components/Advisory';
import Courses from './components/Courses';
import Solutions from './components/Solutions';
import Footer from './components/Footer';
import BackgroundAnimation from './components/BackgroundAnimation';
import OnboardingPage from './pages/auth/onboarding';
import AuthCallback from './pages/auth/callback';
import ResetPassword from './pages/auth/reset-password';
import Dashboard from './pages/Dashboard';
import ConsultationModal from './components/ConsultationModal';

function App() {
  console.log('App component rendering...');
  const { isAuthenticated, isEmailVerified, profile, loading, user } = useAuth();
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  
  console.log('App state:', { isAuthenticated, isEmailVerified, profile, loading });

  // Handle consultation modal events
  useEffect(() => {
    const handleOpenConsultationModal = () => {
      setIsConsultationModalOpen(true);
    };

    window.addEventListener('openConsultationModal', handleOpenConsultationModal);

    return () => {
      window.removeEventListener('openConsultationModal', handleOpenConsultationModal);
    };
  }, []);

  if (loading) {
    console.log('App showing loading screen');
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  console.log('App rendering main content');

  return (
    <div className="min-h-screen bg-[#121212] text-white relative overflow-x-hidden">
      <BackgroundAnimation />
      <div className="relative z-10">
        <Routes>
          {/* Dashboard route - only accessible to authenticated, email-verified users who completed onboarding */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated && isEmailVerified && profile?.onboarding_completed ? (
                <Dashboard />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Auth callback route - handles email verification redirects */}
          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />
          
          {/* Password reset route - handles password reset from email links */}
          <Route 
            path="/auth/reset-password" 
            element={<ResetPassword />} 
          />
          
          {/* Onboarding route - only accessible to authenticated, email-verified users who haven't completed onboarding */}
          <Route 
            path="/onboarding" 
            element={
              loading ? (
                <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading...</p>
                  </div>
                </div>
              ) : isAuthenticated && isEmailVerified && profile && !profile.onboarding_completed ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Main app route */}
          <Route 
            path="/" 
            element={
              <div>
                <Navbar />
                {isAuthenticated && isEmailVerified && profile?.onboarding_completed ? (
                  <Navigate to="/dashboard" replace />
                ) : isAuthenticated && isEmailVerified && profile && !profile.onboarding_completed ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <>
                    <Hero />
                    <Services />
                    <Solutions />
                    <Courses />
                    <Approach />
                    <Advisory />
                    <Footer />
                  </>
                )}
              </div>
            } 
          />
        </Routes>
      </div>
      
      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)}
        userData={isAuthenticated && user ? {
          name: user.user_metadata?.full_name || profile?.full_name || '',
          email: user.email || '',
          phone: profile?.phone || '',
          company_name: profile?.organization_name || '',
          company_website: '',
          services_of_interest: [],
          project_timeline: '',
          estimated_budget: '',
          challenge_to_solve: '',
          company_size: '' // Honeypot field - always empty
        } : undefined}
      />
    </div>
  );
}

export default App;