import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConsultationModal from './ConsultationModal';
import AuthModal from './AuthModal';
import { hasAccountFromCookie } from '../lib/cookies';

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const { isAuthenticated, isEmailVerified } = useAuth();

  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    const handleOpenAuthModal = (event: CustomEvent) => {
      console.log('🎯 Hero: Received openAuthModal event', event.detail);
      setAuthMode(event.detail.mode || 'signup');
      setIsAuthModalOpen(true);
    };

    window.addEventListener('openConsultationModal', handleOpenModal);
    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    
    return () => {
      window.removeEventListener('openConsultationModal', handleOpenModal);
      window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    };
  }, []);

  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated && !isEmailVerified) {
      // User is signed up but not verified
      alert('Please check your email and click the verification link to access all features.');
    } else {
      // User is not authenticated, check cookie to determine mode
      const hasAccount = hasAccountFromCookie();
      setAuthMode(hasAccount ? 'login' : 'signup');
      setIsAuthModalOpen(true);
    }
  };

  const getButtonText = () => {
    if (isAuthenticated && !isEmailVerified) return 'Verify Email';
    
    // Check cookie to see if user has an account
    const hasAccount = hasAccountFromCookie();
    return hasAccount ? 'Log In' : 'Get Started';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-orange-300 to-orange-600 bg-clip-text text-transparent">
            3x Your Revenue
          </span>
          <br />
          <span className="text-white">and </span>
          <span className="bg-gradient-to-r from-orange-300 to-orange-600 bg-clip-text text-transparent">
            Productivity
          </span>
          <br />
          <span className="text-white">with our AI services</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          We optimize your sales and marketing with AI solutions that land clients and boost revenue in weeks not months
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
          >
            Book a Consultation
          </button>
          <button 
            onClick={handleGetStartedClick}
            className="border border-orange-500 text-orange-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-500 hover:text-white transition-all duration-200 transform hover:scale-105"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
      
      <ConsultationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </section>
  );
};

export default Hero;