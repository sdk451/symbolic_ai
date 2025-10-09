import { supabase } from '../lib/supabase';

export interface ConsultationRequest {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  company_website?: string;
  services_of_interest: string[];
  project_timeline: string;
  estimated_budget: string;
  challenge_to_solve: string;
  company_size?: string; // Honeypot field
}

export const submitConsultationRequest = async (data: ConsultationRequest) => {
  try {
    // Honeypot spam detection - if company_size field is filled, it's likely a bot
    if (data.company_size && data.company_size.trim() !== '') {
      console.log('Spam detected: honeypot field was filled');
      throw new Error('Spam submission detected');
    }

    // Remove honeypot field before sending to database
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { company_size, ...cleanData } = data;

    // Ensure we have a valid session before making the database call
    const { data: { session }, error: sessionError } = await (supabase.auth as any).getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error');
    }

    console.log('🔐 Current session:', session ? 'authenticated' : 'anonymous');
    console.log('🔐 User ID:', session?.user?.id || 'none');
    console.log('🔐 Session details:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    });

    // If no session, try to get the current user
    if (!session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User error:', userError);
        throw new Error('Authentication error');
      }
      console.log('🔐 Current user:', user ? 'authenticated' : 'anonymous');
    }

    // Log the data we're trying to insert
    console.log('📝 Data to insert:', {
      ...cleanData,
      status: 'pending',
      submitted_at: new Date().toISOString()
    });

    // Log session details for debugging
    if (session) {
      console.log('🔐 Session tokens:', {
        hasAccessToken: !!session.access_token,
        hasRefreshToken: !!session.refresh_token,
        tokenLength: session.access_token?.length || 0
      });
    }

    // Try using the session's access token directly
    let result, error;
    
    if (session?.access_token) {
      // Create a new Supabase client with the session token
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseWithAuth = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        }
      );
      
      const response = await supabaseWithAuth
        .from('consultation_requests')
        .insert([{
          ...cleanData,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      result = response.data;
      error = response.error;
    } else {
      // Fallback to regular supabase client
      const response = await supabase
        .from('consultation_requests')
        .insert([{
          ...cleanData,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      result = response.data;
      error = response.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error('Failed to submit consultation request');
    }

    return result;
  } catch (error) {
    console.error('Error submitting consultation request:', error);
    throw error;
  }
};