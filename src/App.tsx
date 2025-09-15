import React from 'react';
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

function App() {
  const { isAuthenticated, isEmailVerified, loading } = useAuth();

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
        <Navbar />
        {isAuthenticated && isEmailVerified ? ( 
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
    </div>
  );
}

export default App;