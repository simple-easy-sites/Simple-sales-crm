import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from '../components/ui/Icons';

const AuthCallbackPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This effect is the core of the fix. It waits for the authentication
    // process to finish before deciding where to navigate.
    
    // If the auth provider is no longer loading...
    if (!loading) {
      if (user) {
        // ...and we have a user, the login was successful. Go to the dashboard.
        navigate('/dashboard', { replace: true });
      } else {
        // ...and we DO NOT have a user, the login failed (e.g., expired link). Go back to login.
        navigate('/login', { replace: true });
      }
    }
    // This effect should run whenever the loading or user state changes.
  }, [user, loading, navigate]);

  // Display a spinner while the authentication is in progress.
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <Icons.Spinner className="h-10 w-10 animate-spin text-brand-blue mb-4" />
      <h1 className="text-xl font-semibold">Authenticating...</h1>
      <p className="text-slate-500 dark:text-slate-400">Please wait while we securely log you in.</p>
    </div>
  );
};

export default AuthCallbackPage;
