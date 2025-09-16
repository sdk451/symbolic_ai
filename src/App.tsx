import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Demos from './components/Demos';
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

function App() {
  const { isAuthenticated, isEmailVerified, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

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
              isAuthenticated && isEmailVerified && !profile?.onboarding_completed ? (
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
                  <div id="demos" className="pt-16">
                    <Demos />
                  </div>
                ) : (
                  <Hero />
                )}
                <Services />
                <Solutions />
                <Courses />
                <Approach />
                <Advisory />
                <Footer />
              </div>
            } 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;