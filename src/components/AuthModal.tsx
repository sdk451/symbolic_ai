import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, User, Mail, Phone, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authService, SignUpData, SignInData } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { setAuthStateCookie, isEmailInCookie } from '../lib/cookies';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'login';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { profile, isEmailVerified } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 AuthModal: Opening modal with mode:', initialMode);
      setMode(initialMode); // Update mode when initialMode changes
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        password: ''
      });
      setErrors({});
      setShowPassword(false);
      setIsSubmitting(false);
      setSubmitSuccess(false);
      setSubmitMessage('');
      
      // Focus first input after modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key and focus trap
  useEffect(() => {
    const timeoutId = emailCheckTimeoutRef.current;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      
      // Focus trap
      if (e.key === 'Tab' && isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, onClose]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.length < 2) return 'Full name must be at least 2 characters';
        if (value.length > 50) return 'Full name must be less than 50 characters';
        return '';
      
      case 'phone': {
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        const cleanPhone = value.replace(/[\s\-()]/g, '');
        if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid phone number';
        return '';
      }
      
      case 'email': {
        if (!value.trim()) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      }
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return '';
      
      default:
        return '';
    }
  };

  const checkEmailExists = (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailExists(null);
      return;
    }

    // Only check email existence in signup mode
    if (mode === 'signup') {
      // Use cookie-based checking instead of database query for faster response
      const exists = isEmailInCookie(email);
      setEmailExists(exists);
      
      // If user exists and we're in signup mode, suggest switching to login
      if (exists) {
        console.log('🎯 AuthModal: User exists (from cookie), suggesting login mode');
      }
    } else {
      // In login mode, don't check email existence
      setEmailExists(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    // Check email existence instantly (cookie-based) - only in signup mode
    if (name === 'email' && mode === 'signup') {
      checkEmailExists(value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (mode === 'signup') {
      ['fullName', 'phone', 'email', 'password'].forEach(field => {
        const error = validateField(field, formData[field as keyof FormData]);
        if (error) newErrors[field] = error;
      });
    } else {
      ['email', 'password'].forEach(field => {
        const error = validateField(field, formData[field as keyof FormData]);
        if (error) newErrors[field] = error;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 AuthModal: Form submission started', { mode, formData });
    
    if (!validateForm()) {
      console.log('🎯 AuthModal: Form validation failed');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      if (mode === 'signup') {
        const signUpData: SignUpData = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone
        };

        console.log('🎯 AuthModal: Calling authService.signUp', signUpData);
        const signupResult = await authService.signUp(signUpData);
        
        // Set cookie to remember user has an account
        setAuthStateCookie(true, formData.email);
        
        // Check if email verification is required
        if (signupResult.user && !signupResult.user.email_confirmed_at) {
          setSubmitSuccess(true);
          setSubmitMessage('Account created! Please check your email and click the verification link to complete your registration.');
          console.log('🎯 AuthModal: Signup successful, email verification required');
        } else {
          setSubmitSuccess(true);
          setSubmitMessage('Account created! Redirecting to onboarding...');
          console.log('🎯 AuthModal: Signup successful');
          
          // Redirect to onboarding after successful signup
          setTimeout(() => {
            onClose();
            navigate('/onboarding');
          }, 1500);
        }
      } else {
        const signInData: SignInData = {
          email: formData.email,
          password: formData.password
        };

        console.log('🎯 AuthModal: Calling authService.signIn', signInData);
        await authService.signIn(signInData);
        
        // Set cookie to remember user has an account
        setAuthStateCookie(true, formData.email);
        
        setSubmitSuccess(true);
        setSubmitMessage('Successfully logged in!');
        
        // Close modal and redirect based on onboarding status
        setTimeout(() => {
          onClose();
          // Check if user needs to complete onboarding
          if (isEmailVerified && profile && !profile.onboarding_completed) {
            navigate('/onboarding');
          }
        }, 1500);
        console.log('🎯 AuthModal: Signin successful');
      }
    } catch (error) {
      console.error('🎯 AuthModal: Form submission error', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitMessage(errorMessage);
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMode(mode === 'signup' ? 'login' : 'signup');
      setIsTransitioning(false);
      setSubmitSuccess(false);
      setSubmitMessage('');
    }, 150);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg w-full max-w-md mx-auto transform transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-500/20">
          <h2 className="text-2xl font-bold text-orange-500">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-1"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitSuccess && submitMessage ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4">
                {mode === 'signup' ? 'Check Your Email!' : 'Welcome Back!'}
              </h3>
              <p className="text-gray-300 mb-6">{submitMessage}</p>
              {mode === 'signup' && (
                <div className="space-y-3">
                  <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                  >
                    Got it!
                  </button>
                  {submitMessage.includes('verification link') && (
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">Didn't receive the email?</p>
                      <button
                        onClick={async () => {
                          try {
                            await authService.resendVerification(formData.email);
                            setSubmitMessage('Verification email resent! Please check your inbox.');
                          } catch (error) {
                            setSubmitMessage(error instanceof Error ? error.message : 'Failed to resend verification email');
                            setSubmitSuccess(false);
                          }
                        }}
                        className="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200 underline"
                      >
                        Resend verification email
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name - Signup only */}
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        ref={firstInputRef}
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={`w-full pl-10 pr-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                          errors.fullName ? 'border-red-500' : 'border-gray-600'
                        }`}
                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                      />
                    </div>
                    {errors.fullName && (
                      <p id="fullName-error" className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                )}

                {/* Phone - Signup only */}
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+61 4 1234 5678"
                        className={`w-full pl-10 pr-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                          errors.phone ? 'border-red-500' : 'border-gray-600'
                        }`}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                    </div>
                    {errors.phone && (
                      <p id="phone-error" className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={mode === 'login' ? firstInputRef : undefined}
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className={`w-full pl-10 pr-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                  {!errors.email && emailExists === true && mode === 'signup' && (
                    <p className="mt-1 text-sm text-orange-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      This email is already registered. 
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setEmailExists(null);
                        }}
                        className="ml-1 underline hover:text-orange-300 transition-colors"
                      >
                        Log in instead?
                      </button>
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                      className={`w-full pl-10 pr-12 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                        errors.password ? 'border-red-500' : 'border-gray-600'
                      }`}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors duration-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                  {mode === 'signup' && !errors.password && (
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  )}
                </div>

                {/* Forgot Password Link - Login mode only */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.email) {
                          setSubmitMessage('Please enter your email address first');
                          setSubmitSuccess(false);
                          return;
                        }
                        
                        try {
                          await authService.resetPassword(formData.email);
                          setSubmitMessage('Password reset email sent! Check your inbox.');
                          setSubmitSuccess(true);
                        } catch (error) {
                          setSubmitMessage(error instanceof Error ? error.message : 'Failed to send reset email');
                          setSubmitSuccess(false);
                        }
                      }}
                      className="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {submitMessage && !submitSuccess && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {submitMessage}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    mode === 'signup' ? 'Sign Up' : 'Log In'
                  )}
                </button>

                {/* Mode Toggle */}
                <div className="text-center pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm"
                    disabled={isSubmitting}
                  >
                    {mode === 'signup' 
                      ? 'Already have an account? Log in' 
                      : "Don't have an account? Sign up"
                    }
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;