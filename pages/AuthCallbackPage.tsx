import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from '../components/ui/Icons';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Small delay to ensure auth state is processed
    const timer = setTimeout(() => {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-light-bg dark:bg-dark-bg">
      <div className="text-center">
        <Icons.Spinner className="h-8 w-8 animate-spin text-brand-blue mx-auto mb-4" />
        <p className="text-light-text dark:text-dark-text">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
