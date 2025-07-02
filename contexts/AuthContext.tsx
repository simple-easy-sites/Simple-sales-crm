
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // We now know the auth state, so we're done loading.
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [isConfigured]); // This effect now correctly re-runs when configuration changes

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      // The onAuthStateChange listener will set loading to false.
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

  // Render children only after the initial loading is complete to prevent flicker
  // or premature rendering of child components that depend on auth state.
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
