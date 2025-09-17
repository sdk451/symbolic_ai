import { useState, useEffect } from 'react';
import { Menu, X, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { hasAccountFromCookie } from '../lib/cookies';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isEmailVerified, user, loading } = useAuth();

  // Listen for global auth modal events
  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      console.log('🎯 Navbar: Received openAuthModal event', event.detail);
      // Trigger the Hero's AuthModal instead of the Navbar's
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: event.detail }));
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    };
  }, []);

  const navLinks = ['Services', 'Solutions', 'Advisory', 'Courses', 'Approach'];



  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getAuthButtonText = () => {
    if (loading) return 'Loading...';
    if (isAuthenticated && isEmailVerified) return 'Logout';
    if (isAuthenticated && !isEmailVerified) return 'Verify Email';
    
    // Check cookie to see if user has an account
    const hasAccount = hasAccountFromCookie();
    return hasAccount ? 'Log In' : 'Get Started';
  };

  const getAuthButtonAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated && isEmailVerified) {
      // User is fully authenticated, show logout option
      handleLogout();
    } else if (isAuthenticated && !isEmailVerified) {
      // User is signed up but not verified
      alert('Please check your email and click the verification link to access all features.');
    } else {
      // User is not authenticated, check cookie to determine mode
      const hasAccount = hasAccountFromCookie();
      const mode = hasAccount ? 'login' : 'signup';
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode } }));
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-[#121212]/90 backdrop-blur-sm border-b border-orange-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-300 to-orange-600 bg-clip-text text-transparent">
              Symbolic AI
            </span>
            {/* Welcome message for authenticated users */}
            {isAuthenticated && isEmailVerified && (
              <span className="text-gray-300 font-medium ml-16 text-base">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-gray-300 hover:text-orange-300 transition-colors duration-200 font-medium"
              >
                {link}
              </a>
            ))}
            
            {/* Auth Buttons */}
            {isAuthenticated && isEmailVerified ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-orange-300 transition-colors duration-200 font-medium flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => getAuthButtonAction(e)}
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {getAuthButtonText()}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1a1a1a] rounded-lg mt-2">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block px-3 py-2 text-gray-300 hover:text-orange-400 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {link}
                </a>
              ))}
              
              {/* Mobile Auth Buttons */}
              {isAuthenticated && isEmailVerified ? (
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full mt-2 text-gray-300 hover:text-orange-400 transition-colors duration-200 px-3 py-2 flex items-center justify-center"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={(e) => {
                      getAuthButtonAction(e);
                      setIsOpen(false);
                    }}
                    className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-semibold"
                    disabled={loading}
                  >
                    {getAuthButtonText()}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;