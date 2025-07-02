import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase, initializeSupabase, isSupabaseConfigured } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const configure = useCallback((url: string, key: string) => {
    initializeSupabase(url, key);
    setIsConfigured(true);
  }, []);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const supabase = getSupabase()!;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (_event === 'SIGNED_IN') {
        navigate('/dashboard');
      } else if (_event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConfigured, navigate]);

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
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
