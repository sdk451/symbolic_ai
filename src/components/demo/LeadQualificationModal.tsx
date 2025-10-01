import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, User, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDemoExecution } from '../../hooks/useDemoExecution';
import Portal from '../Portal';

interface LeadQualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallComplete?: (result: any) => void;
}

interface LeadFormData extends Record<string, unknown> {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  companywebsite: string;
  request: string;
  runId: string;
  website: string;
}

interface FormErrors extends Record<string, string | undefined> {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  companywebsite?: string;
  request?: string;
}

const LeadQualificationModal: React.FC<LeadQualificationModalProps> = ({
  isOpen,
  onClose,
  onCallComplete
}) => {
  const { profile, user } = useAuth();
  const { status, clearRun } = useDemoExecution();
  
  const [formData, setFormData] = useState<LeadFormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    companywebsite: 'https://www.yourcompany.com',
    request: '',
    runId: '',
    website: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCallSummary, setShowCallSummary] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    qualified: boolean;
    message: string;
    runId: string;
  } | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [hasModalBeenOpened, setHasModalBeenOpened] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Submitting form data to lead qualification agent...');
  const [agentStatus, setAgentStatus] = useState('');

  // Pre-populate form with user profile data and generate runId
  useEffect(() => {
    if (isOpen && !hasModalBeenOpened) {
      const runId = `lq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Split full name into first and last name
      const fullName = profile?.full_name || '';
      const nameParts = fullName.trim().split(' ');
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';
      
      setFormData(prev => ({
        ...prev,
        firstname,
        lastname,
        email: user?.email || '',
        phone: profile?.phone || '',
        companywebsite: 'https://www.yourcompany.com', // Set default value
        runId,
        website: '' // Always reset honeypot
      }));
      setSubmissionResult(null); // Reset submission result
      
      // Reset status fields
      setAgentStatus('');
      setStatusMessage('Submitting form data to lead qualification agent...');
      
      setHasModalBeenOpened(true);
    } else if (!isOpen) {
      // Reset the flag when modal is closed
      setHasModalBeenOpened(false);
    }
  }, [profile, user, isOpen, hasModalBeenOpened]);

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

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
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

    if (!formData.companywebsite.trim()) {
      newErrors.companywebsite = 'Company website is required';
    } else if (!/^https?:\/\/.+\..+/.test(formData.companywebsite)) {
      newErrors.companywebsite = 'Please enter a valid website URL (starting with http:// or https://)';
    }

    if (!formData.request.trim()) {
      newErrors.request = 'Request description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
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
    setStatusMessage('Submitting form data to lead qualification agent...');
    
    // Set up timeout handling
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setStatusMessage('Request timed out. Please try again or contact us directly.');
        setTimeout(() => {
          setIsSubmitting(false);
        }, 3000); // Show timeout message for 3 seconds
      }
    }, 60000); // 60 second timeout
    
    try {
      // Debug: Log the form data being sent
      console.log('Form data being sent:', formData);
      
      // Send form data directly to n8n webhook (no authentication required)
      const response = await fetch('/.netlify/functions/lead-qualification-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      // Check if response has content
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      // Handle n8n response
      if (result.n8nResponse) {
        const { qualified, statusMessage, message, messsage, output } = result.n8nResponse;
        
        // Check if this is a periodic update (has statusMessage but no final result)
        const updateMessage = statusMessage || message || messsage;
        if (updateMessage && !qualified && !output) {
          // Update the status and status message in the submission modal
          if (result.status) {
            setAgentStatus(result.status);
          }
          setStatusMessage(updateMessage);
          return; // Don't close the modal, just update the message
        }
        
        // This is the final response
        clearTimeout(timeoutId);
        setIsSubmitting(false);
        
        setSubmissionResult({
          qualified: qualified || false,
          message: updateMessage || output || (qualified ? 'Form submitted... lead qualified' : 'Lead not qualified for Symbolic AI'),
          runId: result.runId
        });
        
        // Show response modal with the n8n response text
        setResponseText(updateMessage || output || 'No response message received');
        setShowResponseModal(true);
      } else {
        // Fallback if n8n doesn't return expected format
        clearTimeout(timeoutId);
        setIsSubmitting(false);
        
        setSubmissionResult({
          qualified: false,
          message: 'Form submitted successfully',
          runId: result.runId
        });
        
        // Show response modal with fallback message
        setResponseText('Form submitted successfully');
        setShowResponseModal(true);
      }

    } catch (error) {
      console.error('Form submission error:', error);
      setStatusMessage('An error occurred. Please try again or contact us directly.');
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000); // Show error message for 3 seconds
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleClose = () => {
    clearRun();
    setShowCallSummary(false);
    setSubmissionResult(null);
    setErrors({});
    setShowResponseModal(false);
    setResponseText('');
    onClose();
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setResponseText('');
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
        className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                {/* Name Fields - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstname}
                      onChange={(e) => handleInputChange('firstname', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.firstname ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstname && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.firstname}
                      </p>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastname}
                      onChange={(e) => handleInputChange('lastname', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.lastname ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastname && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.lastname}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Fields - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Company Website Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={formData.companywebsite}
                    onChange={(e) => handleInputChange('companywebsite', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.companywebsite ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="https://www.yourcompany.com"
                  />
                  {errors.companywebsite && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.companywebsite}
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

                {/* Invisible Fields */}
                <input
                  type="hidden"
                  name="runId"
                  value={formData.runId}
                />
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Submission Result Display */}
                {submissionResult && (
                  <div className={`p-4 rounded-lg border ${
                    submissionResult.qualified 
                      ? 'border-green-500/20 bg-green-500/10' 
                      : 'border-red-500/20 bg-red-500/10'
                  }`}>
                    <div className={`flex items-center ${
                      submissionResult.qualified ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {submissionResult.qualified ? (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 mr-2" />
                      )}
                      <span className="font-medium">{submissionResult.message}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Run ID: {submissionResult.runId}
                    </p>
                    {submissionResult.qualified && (
                      <p className="text-sm text-gray-300 mt-2">
                        Our AI agent will call you shortly to discuss your requirements.
                      </p>
                    )}
                  </div>
                )}

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
                  disabled={isSubmitting || !!submissionResult}
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting Form...
                    </>
                  ) : submissionResult ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Form Submitted
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Submit Lead Qualification Form
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

      {/* Submission Modal */}
      {isSubmitting && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] p-4"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div 
            className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg max-w-md w-full"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-orange-500/20">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 mr-3">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-white">Sales Agent</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                {agentStatus && (
                  <p className="text-orange-400 text-center font-medium mb-2">
                    {agentStatus}
                  </p>
                )}
                <p className="text-gray-300 text-center">
                  {statusMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] p-4"
          onClick={handleCloseResponseModal}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div 
            className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-orange-500/20">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 mr-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">AI Response</h2>
              </div>
              <button
                onClick={handleCloseResponseModal}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {responseText}
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseResponseModal}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Portal>
  );
};

export default LeadQualificationModal;
