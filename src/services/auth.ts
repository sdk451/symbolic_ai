import { supabase } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface CompleteOnboardingData {
  personaSegment: 'SMB' | 'SOLO' | 'EXEC' | 'FREELANCER' | 'ASPIRING';
  organizationName?: string;
  organizationSize?: string;
}

export const authService = {
  async signUp({ email, password, fullName, phone }: SignUpData) {
    console.log('🔐 AuthService: Starting signup process', { email, fullName, phone });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { // This data is passed to the handle_new_user trigger
            full_name: fullName,
            phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log('🔐 AuthService: Supabase signup response', { data, error });

      if (error) {
        console.error('🔐 AuthService: Signup error', error);
        throw new Error(error.message);
      }

      console.log('🔐 AuthService: Signup successful', data);
      return data;
    } catch (error) {
      console.error('🔐 AuthService: Signup exception', error);
      throw error;
    }
  },

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  },

  async resendVerification(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async completeOnboarding({ personaSegment, organizationName, organizationSize }: CompleteOnboardingData) {
    console.log('🔐 AuthService: Completing onboarding', { personaSegment, organizationName, organizationSize });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          persona_segment: personaSegment,
          organization_name: organizationName || null,
          organization_size: organizationSize || null,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('🔐 AuthService: Onboarding completion error', error);
        throw new Error(error.message);
      }

      console.log('🔐 AuthService: Onboarding completed successfully');
      return { success: true };
    } catch (error) {
      console.error('🔐 AuthService: Onboarding completion exception', error);
      throw error;
    }
  }
};