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
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const configure = useCallback((url: string, key: string) => {
    initializeSupabase(url, key);
    setIsConfigured(true);
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

    // The onAuthStateChange listener is the single source of truth for auth state.
    // Its ONLY responsibility is to update the state in this context.
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
  }, [isConfigured]);

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
      // onAuthStateChange will automatically update the user state to null,
      // and ProtectedRoute will handle redirecting to the login page.
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
