import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  // const [_searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash and search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        // Check for error in URL
        if (error) {
          console.error('Auth callback error from URL:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed');
          setTimeout(() => navigate('/?error=auth_error'), 3000);
          return;
        }

        // If we have tokens in the URL, exchange them for a session
        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Failed to establish session');
            setTimeout(() => navigate('/?error=session_error'), 3000);
            return;
          }

          if (data.session) {
            setStatus('success');
            setMessage('Email verified successfully!');
            setTimeout(() => navigate('/?verified=true'), 2000);
            return;
          }
        }

        // Fallback: check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setStatus('error');
          setMessage('Authentication error');
          setTimeout(() => navigate('/?error=auth_error'), 3000);
          return;
        }

        if (session) {
          setStatus('success');
          setMessage('Welcome back!');
          setTimeout(() => navigate('/?verified=true'), 2000);
        } else {
          setStatus('error');
          setMessage('No active session found');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => navigate('/?error=auth_error'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Verifying your account...</h2>
            <p className="text-gray-300">Please wait while we complete your authentication.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-400">Success!</h2>
            <p className="text-gray-300">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Error</h2>
            <p className="text-gray-300">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;