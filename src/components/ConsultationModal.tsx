import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitConsultationRequest } from '../api/consultation';
import Portal from './Portal';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  company_website: string;
  services_of_interest: string[];
  project_timeline: string;
  estimated_budget: string;
  challenge_to_solve: string;
  company_size: string; // Honeypot field
}

interface FormErrors {
  [key: string]: string;
}

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: {
    name: string;
    email: string;
    phone: string;
    company_name: string;
    company_website: string;
    services_of_interest: string[];
    project_timeline: string;
    estimated_budget: string;
    challenge_to_solve: string;
    company_size: string;
  };
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, userData }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    company_website: '',
    services_of_interest: [],
    project_timeline: '',
    estimated_budget: '',
    challenge_to_solve: '',
    company_size: '' // Honeypot field - should remain empty
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const serviceOptions = [
    'AI Agents & Assistants',
    'AI Automations & Workflows',
    'AI Opportunity Audit',
    'AI Consulting & Advisory',
    'AI Strategy',
    'Fractional CTO',
    'Personal Productivity / Career Coaching'
  ];

  // Auto-save to localStorage and pre-populate with user data
  useEffect(() => {
    if (isOpen && !isFormInitialized) {
      // Always prioritize userData for pre-population
      if (userData) {
        console.log('Pre-populating form with userData:', userData);
        // Clear any existing draft data when using userData
        localStorage.removeItem('consultation_form_draft');
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          company_name: userData.company_name,
          company_website: userData.company_website,
          services_of_interest: userData.services_of_interest,
          project_timeline: userData.project_timeline,
          estimated_budget: userData.estimated_budget,
          challenge_to_solve: userData.challenge_to_solve,
          company_size: '' // Always empty for honeypot
        });
      } else {
        // Fallback to saved data if no userData
        const savedData = localStorage.getItem('consultation_form_draft');
        if (savedData) {
          try {
            console.log('Loading saved form data:', savedData);
            const parsedData = JSON.parse(savedData);
            // Always clear the honeypot field when loading saved data
            parsedData.company_size = '';
            setFormData(parsedData);
          } catch (e) {
            console.error('Error loading saved form data:', e);
          }
        }
      }
      setIsFormInitialized(true);
      // Focus first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, userData, isFormInitialized]);

  useEffect(() => {
    if (isOpen && !isSubmitted) {
      localStorage.setItem('consultation_form_draft', JSON.stringify(formData));
    }
  }, [formData, isOpen, isSubmitted]);

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsFormInitialized(false);
    }
  }, [isOpen]);

  // Handle ESC key and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose(false); // Don't reset form when pressing ESC
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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the modal container to ensure it captures all events
      const modalElement = document.querySelector('[data-modal="consultation"]') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateField = (name: string, value: string | string[]): string => {
    switch (name) {
      case 'name':
        if (typeof value !== 'string') return 'Invalid value type';
        if (!value.trim()) return 'Full name is required';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return '';
      
      case 'email': {
        if (typeof value !== 'string') return 'Invalid value type';
        if (!value.trim()) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        const personalDomains = ['hotmail.com',];
        const domain = value.split('@')[1]?.toLowerCase();
        if (personalDomains.includes(domain)) {
          return 'Business email preferred for faster response';
        }
        return '';
      }
      
      case 'phone': {
        if (typeof value !== 'string') return 'Invalid value type';
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        const cleanPhone = value.replace(/[\s\-()]/g, '');
        if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid phone number';
        return '';
      }
      
      case 'company_name':
        if (typeof value !== 'string') return 'Invalid value type';
        if (!value.trim()) return 'Company name is required';
        return '';
      
      case 'company_website':
        if (typeof value !== 'string') return 'Invalid value type';
        if (value.trim() && !/^https?:\/\/.+\..+/.test(value)) {
          return 'Please enter a valid website URL (include http:// or https://)';
        }
        return '';
      
      case 'services_of_interest':
        if (!Array.isArray(value) || value.length === 0) {
          return 'Please select at least one service';
        }
        return '';
      
      case 'project_timeline':
        if (typeof value !== 'string') return 'Invalid value type';
        if (!value.trim()) return 'Project timeline is required';
        return '';
      
      case 'estimated_budget':
        if (typeof value !== 'string') return 'Invalid value type';
        if (!value.trim()) return 'Estimated budget is required';
        return '';
      
      case 'challenge_to_solve':
        if (typeof value !== 'string') return 'Invalid value type';
        if (!value.trim()) return 'Challenge description is required';
        if (value.trim().length < 10) return 'Please provide at least 10 characters';
        if (value.length > 500) return 'Description must be less than 500 characters';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleCheckboxChange = (service: string) => {
    const updatedServices = formData.services_of_interest.includes(service)
      ? formData.services_of_interest.filter(s => s !== service)
      : [...formData.services_of_interest, service];
    
    setFormData(prev => ({ ...prev, services_of_interest: updatedServices }));
    
    const error = validateField('services_of_interest', updatedServices);
    setErrors(prev => ({ ...prev, services_of_interest: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'company_website') { // company_website is optional
        const value = formData[key as keyof FormData];
        if (key === 'services_of_interest') {
          const error = validateField(key, value as string[]);
          if (error) newErrors[key] = error;
        } else {
          const error = validateField(key, value as string);
          if (error) newErrors[key] = error;
        }
      } else if (formData.company_website) {
        const error = validateField(key, formData.company_website);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitConsultationRequest(formData);

      setIsSubmitted(true);
      localStorage.removeItem('consultation_form_draft');
    } catch (error) {
      setSubmitError('Failed to submit your request. Please try again or contact us directly.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (resetForm = false) => {
    if (isSubmitted || resetForm) {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        company_website: '',
        services_of_interest: [],
        project_timeline: '',
        estimated_budget: '',
        challenge_to_solve: '',
        company_size: ''
      });
      setErrors({});
    }
    // Only reset initialization flag if we're resetting the form
    if (resetForm) {
      setIsFormInitialized(false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 overflow-y-auto"
        onClick={() => handleClose(false)} // Don't reset form when clicking outside
        onMouseDown={(e) => e.preventDefault()}
        data-modal="consultation"
        tabIndex={-1}
      >
      <div
        ref={modalRef}
        className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg w-full max-w-2xl my-8 mx-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-500/20">
          <h2 className="text-2xl font-bold text-orange-500">Book a Consultation</h2>
          <button
            onClick={() => handleClose(true)} // Reset form when clicking X
            className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-gray-300 mb-4">
                Your consultation request has been submitted successfully. We'll get back to soon.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Reference: SYMB-{Date.now().toString().slice(-6)}
              </p>
              <button
                onClick={() => handleClose(true)} // Reset form when clicking Close after success
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your business email"
                    className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone and Company Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+61 (4) 123-4567"
                    className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                      errors.phone ? 'border-red-500' : 'border-gray-600'
                    }`}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                    className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                      errors.company_name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    aria-describedby={errors.company_name ? 'company-name-error' : undefined}
                  />
                  {errors.company_name && (
                    <p id="company-name-error" className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.company_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Company Website */}
              <div>
                <label htmlFor="company_website" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  id="company_website"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleInputChange}
                  placeholder="https://www.yourcompany.com"
                  className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                    errors.company_website ? 'border-red-500' : 'border-gray-600'
                  }`}
                  aria-describedby={errors.company_website ? 'website-error' : undefined}
                />
                {errors.company_website && (
                  <p id="website-error" className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.company_website}
                  </p>
                )}
              </div>

              {/* Services of Interest */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Services of Interest * (Select at least one)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {serviceOptions.map((service) => (
                    <label key={service} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services_of_interest.includes(service)}
                        onChange={() => handleCheckboxChange(service)}
                        className="w-4 h-4 text-orange-500 bg-[#121212] border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-gray-300 text-sm">{service}</span>
                    </label>
                  ))}
                </div>
                {errors.services_of_interest && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.services_of_interest}
                  </p>
                )}
              </div>

              {/* Timeline and Budget Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="project_timeline" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Timeline *
                  </label>
                  <input
                    type="text"
                    id="project_timeline"
                    name="project_timeline"
                    value={formData.project_timeline}
                    onChange={handleInputChange}
                    placeholder="e.g., 2-6 weeks, ASAP, Q1 2026"
                    className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                      errors.project_timeline ? 'border-red-500' : 'border-gray-600'
                    }`}
                    aria-describedby={errors.project_timeline ? 'timeline-error' : undefined}
                  />
                  {errors.project_timeline && (
                    <p id="timeline-error" className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.project_timeline}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="estimated_budget" className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Budget *
                  </label>
                  <input
                    type="text"
                    id="estimated_budget"
                    name="estimated_budget"
                    value={formData.estimated_budget}
                    onChange={handleInputChange}
                    placeholder="e.g., <$5k, $5k-10k, $10k-50k, $50k+"
                    className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 ${
                      errors.estimated_budget ? 'border-red-500' : 'border-gray-600'
                    }`}
                    aria-describedby={errors.estimated_budget ? 'budget-error' : undefined}
                  />
                  {errors.estimated_budget && (
                    <p id="budget-error" className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.estimated_budget}
                    </p>
                  )}
                </div>
              </div>

              {/* Honeypot field - hidden from users but visible to bots */}
              <div style={{ display: 'none' }}>
                <label htmlFor="company_size">Company Size (leave blank)</label>
                <input
                  type="text"
                  id="company_size"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleInputChange}
                  placeholder="mandatory"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Challenge Description */}
              <div>
                <label htmlFor="challenge_to_solve" className="block text-sm font-medium text-gray-300 mb-2">
                  Challenge Description * (20-500 characters)
                </label>
                <textarea
                  id="challenge_to_solve"
                  name="challenge_to_solve"
                  value={formData.challenge_to_solve}
                  onChange={handleInputChange}
                  placeholder="Describe the specific business challenge you want AI to solve..."
                  rows={4}
                  className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 resize-vertical ${
                    errors.challenge_to_solve ? 'border-red-500' : 'border-gray-600'
                  }`}
                  aria-describedby={errors.challenge_to_solve ? 'challenge-error' : undefined}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.challenge_to_solve ? (
                    <p id="challenge-error" className="text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.challenge_to_solve}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <span className="text-xs text-gray-500">
                    {formData.challenge_to_solve.length}/500
                  </span>
                </div>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {submitError}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => handleClose(true)} // Reset form when clicking Cancel
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Object.keys(errors).some(key => errors[key])}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Book Consultation'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </Portal>
  );
};

export default ConsultationModal;