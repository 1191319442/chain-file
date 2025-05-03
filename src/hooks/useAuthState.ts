
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@/types/auth';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Set up auth state listener first to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setLoading(true);
        
        if (newSession) {
          // Get user profile from the profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', newSession.user.id)
            .single();
          
          const customUser: User = {
            id: newSession.user.id,
            email: newSession.user.email || '',
            username: profileData?.username || newSession.user.email || '',
            role: (profileData?.is_admin ? 'admin' : 'user') as any,
            publicKey: newSession.user.user_metadata?.publicKey || ''
          };
          
          // Convert Supabase session to our app's session format
          const customSession: Session = {
            token: newSession.access_token,
            user: customUser,
            expiresAt: new Date(newSession.expires_at || 0).getTime()
          };
          
          setSession(customSession);
          setUser(customUser);
          setIsAuthenticated(true);
        } else {
          // Clear session state if no active session
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (currentSession) {
        // Get user profile from the profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .single();
        
        const customUser: User = {
          id: currentSession.user.id,
          email: currentSession.user.email || '',
          username: profileData?.username || currentSession.user.email || '',
          role: (profileData?.is_admin ? 'admin' : 'user') as any,
          publicKey: currentSession.user.user_metadata?.publicKey || ''
        };
        
        // Convert Supabase session to our app's session format
        const customSession: Session = {
          token: currentSession.access_token,
          user: customUser,
          expiresAt: new Date(currentSession.expires_at || 0).getTime()
        };
        
        setSession(customSession);
        setUser(customUser);
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, setUser, session, setSession, loading, isAuthenticated };
};
