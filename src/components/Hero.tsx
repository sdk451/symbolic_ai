import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ConsultationModal from './ConsultationModal';
import AuthModal from './AuthModal';

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, isEmailVerified } = useAuth();

  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('openConsultationModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openConsultationModal', handleOpenModal);
    };
  }, []);

  const handleGetStartedClick = () => {
    if (isAuthenticated && isEmailVerified) {
      // User is fully authenticated, scroll to demos
      const demosSection = document.getElementById('demos');
      if (demosSection) {
        demosSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (isAuthenticated && !isEmailVerified) {
      // User is signed up but not verified
      alert('Please check your email and click the verification link to access all features.');
    } else {
      // User is not authenticated, open signup modal
      setIsAuthModalOpen(true);
    }
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
          We optimize your business with AI solutions that land clients, and boost revenue in weeks not months
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
            {isAuthenticated && isEmailVerified ? 'View Demos' : 'Get Started'}
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
        initialMode="signup"
      />
    </section>
  );
};

export default Hero;