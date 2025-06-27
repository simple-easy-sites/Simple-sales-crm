import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
// import { HARDCODED_USERS, LOCAL_STORAGE_KEYS } from '../constants'; // Removed
import { supabase, mapSupabaseUserToAppUser } from '../lib/supabaseClient'; // Added
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password_param: string) => Promise<string | null>; // Returns error message string or null on success
  logout: () => void;
  isLoading: boolean;
  session: Session | null; // Added session state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setCurrentUser(mapSupabaseUserToAppUser(session?.user ?? null));
      setIsLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setCurrentUser(mapSupabaseUserToAppUser(session?.user ?? null));
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password_param: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password_param,
      });
      if (error) {
        console.error('Login error:', error.message);
        setIsLoading(false);
        return error.message;
      }
      // onAuthStateChange will handle setting the user and session
      // setIsLoading will be handled by onAuthStateChange listener
      return null;
    } catch (e: any) {
      console.error('Login exception:', e);
      const errorMessage = e.message || "An unexpected error occurred during login.";
      setIsLoading(false);
      return errorMessage;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout error: ', error.message);
    }
    // onAuthStateChange will clear user and session
    // setIsLoading will be handled by onAuthStateChange listener
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading, session }}>
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
