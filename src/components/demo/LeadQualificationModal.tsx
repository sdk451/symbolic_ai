import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, User, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDemoExecution } from '../../hooks/useDemoExecution';
import Portal from '../Portal';

interface LeadQualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallComplete?: (result: any) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  request: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  request?: string;
}

const LeadQualificationModal: React.FC<LeadQualificationModalProps> = ({
  isOpen,
  onClose,
  onCallComplete
}) => {
  const { profile, user } = useAuth();
  const { status, startDemo, clearRun } = useDemoExecution();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    request: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCallSummary, setShowCallSummary] = useState(false);

  // Pre-populate form with user profile data
  useEffect(() => {
    if (profile && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: user?.email || '',
        phone: profile.phone || ''
      }));
    }
  }, [profile, user, isOpen]);

  // Handle demo status changes
  useEffect(() => {
    if (status?.status === 'succeeded' && status.outputData) {
      setShowCallSummary(true);
      onCallComplete?.(status.outputData);
    }
  }, [status]); // Removed onCallComplete from dependencies to prevent infinite loops

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the modal container to ensure it captures all events
      const modalElement = document.querySelector('[data-modal="lead-qualification"]') as HTMLElement;
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.request.trim()) {
      newErrors.request = 'Request description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await startDemo('speed-to-lead-qualification', formData);
      
      if (!result.success) {
        // Show more specific error messages
        if (result.message?.includes('rate limit')) {
          alert('You have reached the demo execution limit. Please try again later.');
        } else if (result.message?.includes('authentication')) {
          alert('Please log in again to continue.');
        } else {
          alert(result.message || 'Failed to start demo. Please try again.');
        }
      }
    } catch (error) {
      console.error('Demo start error:', error);
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    clearRun();
    setShowCallSummary(false);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
        onClick={handleClose}
        onMouseDown={(e) => e.preventDefault()}
        data-modal="lead-qualification"
        tabIndex={-1}
      >
      <div 
        className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-500/20">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 mr-3">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Lead Qualification Demo</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showCallSummary ? (
            <>
              <p className="text-gray-300 mb-6">
                Fill out the form below and our AI agent will call you to qualify your lead and provide insights.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Request Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Request Description
                  </label>
                  <textarea
                    value={formData.request}
                    onChange={(e) => handleInputChange('request', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                      errors.request ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Describe your request or inquiry..."
                  />
                  {errors.request && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.request}
                    </p>
                  )}
                </div>

                {/* Demo Status Display */}
                {status && (
                  <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/10">
                    {status.status === 'queued' && (
                      <div className="flex items-center text-blue-400">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm">Demo queued for execution...</span>
                      </div>
                    )}
                    {status.status === 'running' && (
                      <div className="flex items-center text-yellow-400">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm">AI agent is calling you now...</span>
                      </div>
                    )}
                    {status.status === 'failed' && (
                      <div className="flex items-center text-red-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <div className="flex-1">
                          <span className="text-sm block">Demo failed</span>
                          <span className="text-xs text-gray-400">
                            {status.errorMessage || 'Unknown error occurred'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            clearRun();
                            setErrors({});
                          }}
                          className="ml-2 text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    {status.status === 'cancelled' && (
                      <div className="flex items-center text-gray-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">Demo was cancelled</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || status?.status === 'running' || status?.status === 'queued'}
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting || status?.status === 'queued' || status?.status === 'running' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {status?.status === 'running' ? 'Call in Progress...' : 'Starting Demo...'}
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Start Lead Qualification Call
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="p-4 rounded-full bg-green-500/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Call Completed!</h3>
              <p className="text-gray-300 mb-4">
                The AI agent has completed the lead qualification call. Check your dashboard for the detailed summary.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </Portal>
  );
};

export default LeadQualificationModal;
