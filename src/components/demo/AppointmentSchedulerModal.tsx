import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Portal from '../Portal';


// Declare custom VAPI widget element and global API
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vapi-widget': {
        'public-key'?: string;
        'assistant-id'?: string;
        'assistant-overrides'?: string;
        'mode'?: string;
        'theme'?: string;
        'base-bg-color'?: string;
        'accent-color'?: string;
        'cta-button-color'?: string;
        'cta-button-text-color'?: string;
        'border-radius'?: string;
        'size'?: string;
        'position'?: string;
        'title'?: string;
        'start-button-text'?: string;
        'end-button-text'?: string;
        'chat-first-message'?: string;
        'chat-placeholder'?: string;
        'voice-show-transcript'?: string;
        'consent-required'?: string;
      };
    }
  }
  
  interface Window {
    Vapi?: {
      start: (config: { assistantId: string; publicKey: string }) => void;
    };
  }
}

interface AppointmentSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}



const AppointmentSchedulerModal: React.FC<AppointmentSchedulerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { profile, user } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Create the assistant configuration object with user data
  const customerFirstName = profile?.full_name?.split(' ')[0] || 'John';
  const customerName = profile?.full_name || user?.email || 'John Doe';
  const customerEmail = user?.email || 'john.doe@example.com';
  
  // Build the assistant overridesobject
  const assistantOverridesString = JSON.stringify({
      "variableValues": {
        "customerFirstName": customerFirstName,
        "customerName": customerName,
        "customerEmail": customerEmail
      }
  });



  // Load VAPI script when modal opens
  useEffect(() => {
    if (isOpen) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
      script.async = true;
      script.type = 'text/javascript';
      document.head.appendChild(script);

      // Add CSS to override VAPI widget positioning
      const style = document.createElement('style');
      style.textContent = `
        vapi-widget,
        vapi-widget *,
        [data-vapi-widget],
        [data-vapi-widget] * {
          position: relative !important;
          bottom: auto !important;
          right: auto !important;
          left: auto !important;
          top: auto !important;
          transform: none !important;
          float: none !important;
          clear: both !important;
        }
        .vapi-widget-container {
          position: relative !important;
          overflow: hidden !important;
          width: 100% !important;
          height: auto !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        // Cleanup script and style when modal closes
        const existingScript = document.querySelector('script[src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"]');
        if (existingScript) {
          existingScript.remove();
        }
        const existingStyle = document.querySelector('style');
        if (existingStyle && existingStyle.textContent?.includes('vapi-widget')) {
          existingStyle.remove();
        }
      };
    }
  }, [isOpen]);

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


  const handleClose = () => {
    setShowConfirmation(false);
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
                Click the start button to initiate the AI call.
              </p>

              <div className="space-y-4">
                
                {/* VAPI Widget */}
                <div className="w-full">
                  <vapi-widget
                    public-key={import.meta.env.VITE_VAPI_PUBLIC_API_KEY}
                    assistant-id="1c46cf54-a261-4228-98d3-939d12da3237"
                    assistant-override={assistantOverridesString}
                    mode="voice"
                    theme="dark"
                    base-bg-color="#000000"
                    accent-color="#884b04"
                    cta-button-color="#000000"
                    cta-button-text-color="#ec8d2d"
                    border-radius="medium"
                    size="compact"
                    position="bottom-right"
                    title="AI ASSISTANT CALL"
                    start-button-text="Start"
                    end-button-text="End Call"
                    chat-first-message="Hey, How can I help you today?"
                    chat-placeholder="Type your message..."
                    voice-show-transcript="true"
                    consent-required="false"
                  ></vapi-widget>
                </div>
              </div>

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
