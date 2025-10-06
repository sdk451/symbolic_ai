import React, { useEffect, useRef, useState } from 'react';

interface VapiWidgetProps {
  assistantId: string;
  publicKey: string;
  onCallStart?: () => void;
  onCallEnd?: (data: any) => void;
  onCallStatusChange?: (status: string) => void;
  className?: string;
}

declare global {
  interface Window {
    VapiWidget?: any;
  }
}

const VapiWidget: React.FC<VapiWidgetProps> = ({
  assistantId,
  publicKey,
  onCallStart,
  onCallEnd,
  onCallStatusChange,
  className = ''
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Load VAPI widget script if not already loaded
    const loadVapiScript = () => {
      try {
        if (window.VapiWidget) {
          initializeWidget();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
        script.async = true;
        script.type = 'text/javascript';
        script.onload = () => {
          console.log('VAPI script loaded successfully');
          setIsLoaded(true);
          initializeWidget();
        };
        script.onerror = (error) => {
          console.error('Failed to load VAPI widget script:', error);
          setIsLoaded(false);
          setHasError(true);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading VAPI script:', error);
        setIsLoaded(false);
        setHasError(true);
      }
    };

    const initializeWidget = () => {
      if (!widgetRef.current || !window.VapiWidget) return;

      try {
        // Create the VAPI widget element
        const widgetElement = document.createElement('vapi-widget');
        widgetElement.setAttribute('assistant-id', assistantId);
        widgetElement.setAttribute('public-key', publicKey);
        
        // Add event listeners for VAPI events
        widgetElement.addEventListener('call-start', (event: any) => {
          console.log('VAPI call started:', event.detail);
          onCallStart?.();
          onCallStatusChange?.('started');
        });

        widgetElement.addEventListener('call-end', (event: any) => {
          console.log('VAPI call ended:', event.detail);
          onCallEnd?.(event.detail);
          onCallStatusChange?.('ended');
        });

        widgetElement.addEventListener('call-status-change', (event: any) => {
          console.log('VAPI call status changed:', event.detail);
          onCallStatusChange?.(event.detail.status);
        });

        widgetElement.addEventListener('error', (event: any) => {
          console.error('VAPI widget error:', event.detail);
          setHasError(true);
          onCallStatusChange?.('error');
        });

        // Clear any existing content and add the widget
        widgetRef.current.innerHTML = '';
        widgetRef.current.appendChild(widgetElement);
        
      } catch (error) {
        console.error('Error initializing VAPI widget:', error);
        setHasError(true);
      }
    };

    loadVapiScript();

    // Cleanup function
    return () => {
      if (widgetRef.current) {
        widgetRef.current.innerHTML = '';
      }
    };
  }, [assistantId, publicKey, onCallStart, onCallEnd, onCallStatusChange]);

  return (
    <div 
      ref={widgetRef} 
      className={`vapi-widget-container ${className}`}
      style={{ minHeight: '60px' }}
    >
      {hasError ? (
        <div className="flex items-center justify-center p-4 text-red-400">
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Voice Assistant Unavailable</div>
            <div className="text-xs text-gray-400">Please try again later</div>
          </div>
        </div>
      ) : !isLoaded ? (
        <div className="flex items-center justify-center p-4 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-sm">Loading voice assistant...</span>
        </div>
      ) : null}
    </div>
  );
};

export default VapiWidget;
