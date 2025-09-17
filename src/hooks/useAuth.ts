import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  persona_segment: 'SMB' | 'SOLO' | 'EXEC' | 'FREELANCER' | 'ASPIRING' | null;
  onboarding_completed: boolean;
  organization_name: string | null;
  organization_size: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  refreshProfile: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Separate effect for auth state changes
  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect for profile fetching - only runs when user changes
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!mounted) return;

        if (error) {
          console.error('Error fetching profile:', error);
          // Set default profile for new users
          setProfile({
            id: userId,
            full_name: '',
            phone: null,
            email: '',
            persona_segment: null,
            onboarding_completed: false,
            organization_name: null,
            organization_size: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (mounted) {
          // Set default profile on error
          setProfile({
            id: userId,
            full_name: '',
            phone: null,
            email: '',
            persona_segment: null,
            onboarding_completed: false,
            organization_name: null,
            organization_size: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user]); // Only depend on user, not profile

  const isAuthenticated = !!user && !!session;
  const isEmailVerified = user?.email_confirmed_at != null;

  const refreshProfile = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error refreshing profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    isAuthenticated,
    isEmailVerified,
    refreshProfile
  };
};