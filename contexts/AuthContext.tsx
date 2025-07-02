import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase, initializeSupabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isConfigured: boolean;
  configure: (url: string, key: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }): React.ReactNode => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true
  const [isConfigured, setIsConfigured] = useState(false);
  const navigate = useNavigate();

  const configure = useCallback((url: string, key: string) => {
    initializeSupabase(url, key);
    setIsConfigured(true);
    // Setting isConfigured will trigger the useEffect below
  }, []);

  useEffect(() => {
    // Initial check on mount
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase()!;
    let isMounted = true;

    // The onAuthStateChange listener is the single source of truth.
    // It fires once on load with the current session, and again on any change.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // We now know the auth state, so we're done loading.
        
        // This is the critical fix for the redirect loop. When Supabase confirms
        // the sign-in, we programmatically navigate to the dashboard.
        if (event === 'SIGNED_IN') {
          navigate('/dashboard', { replace: true });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [isConfigured, navigate]); // This effect now correctly re-runs when configuration changes

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  const value = {
    session,
    user,
    loading,
    logout,
    isConfigured,
    configure
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};