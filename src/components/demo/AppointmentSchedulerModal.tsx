import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, User, Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDemoExecution } from '../../hooks/useDemoExecution';
import Portal from '../Portal';

interface AppointmentSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentScheduled?: (result: any) => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  requestedTime?: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

const AppointmentSchedulerModal: React.FC<AppointmentSchedulerModalProps> = ({
  isOpen,
  onClose,
  onAppointmentScheduled
}) => {
  const { profile, user } = useAuth();
  const { status, startDemo, clearRun } = useDemoExecution();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    requestedTime: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Pre-populate form with user profile data
  useEffect(() => {
    if (profile && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || '',
        phone: profile.phone || '',
        email: user?.email || ''
      }));
    }
  }, [profile, user, isOpen]);

  // Handle demo status changes
  useEffect(() => {
    if (status?.status === 'succeeded' && status.outputData) {
      setShowConfirmation(true);
      onAppointmentScheduled?.(status.outputData);
    }
  }, [status, onAppointmentScheduled]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the modal container to ensure it captures all events
      const modalElement = document.querySelector('[data-modal="appointment-scheduler"]') as HTMLElement;
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

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

  const handleCallMe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await startDemo('ai-appointment-scheduler', formData);
      
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
    setShowConfirmation(false);
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
        data-modal="appointment-scheduler"
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
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-red-600 mr-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Appointment Scheduler</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showConfirmation ? (
            <>
              <p className="text-gray-300 mb-6">
                Fill out your contact information and our AI scheduler will call you to find the perfect appointment time.
              </p>

              <form onSubmit={handleCallMe} className="space-y-4">
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

                {/* Requested Time Field (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Preferred Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.requestedTime}
                    onChange={(e) => handleInputChange('requestedTime', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 'morning', 'afternoon', 'next week'"
                  />
                </div>

                {/* Demo Status Display */}
                {status && (
                  <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/10">
                    {status.status === 'queued' && (
                      <div className="flex items-center text-blue-400">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm">Scheduling call queued...</span>
                      </div>
                    )}
                    {status.status === 'running' && (
                      <div className="flex items-center text-yellow-400">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm">AI scheduler is calling you now...</span>
                      </div>
                    )}
                    {status.status === 'failed' && (
                      <div className="flex items-center text-red-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <div className="flex-1">
                          <span className="text-sm block">Scheduling failed</span>
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
                        <span className="text-sm">Scheduling was cancelled</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Call Me Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || status?.status === 'running' || status?.status === 'queued'}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting || status?.status === 'queued' || status?.status === 'running' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {status?.status === 'running' ? 'Call in Progress...' : 'Starting Call...'}
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Call Me to Schedule
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
              <h3 className="text-xl font-semibold text-white mb-2">Appointment Scheduled!</h3>
              <p className="text-gray-300 mb-4">
                The AI scheduler has successfully scheduled your appointment. Check your email for confirmation details.
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

export default AppointmentSchedulerModal;
