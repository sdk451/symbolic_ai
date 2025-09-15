import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          // Redirect to home with error
          window.location.href = '/?error=auth_error';
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to home
          window.location.href = '/?verified=true';
        } else {
          // No session, redirect to home
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        window.location.href = '/?error=auth_error';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Verifying your account...</h2>
        <p className="text-gray-300">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback;