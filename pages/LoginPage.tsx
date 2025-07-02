import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Icons } from '../components/ui/Icons';
import { useAuth } from '../contexts/AuthContext';
import ConfigModal from '../components/ConfigModal';

const LoginPage: React.FC = () => {
  const { session, isConfigured, configure } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
        setError("Supabase is not configured correctly.");
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for the magic link!');
    }
    setLoading(false);
  };
  
  const handleConfigured = (url: string, key: string) => {
    configure(url, key);
    setShowConfigModal(false);
    // You can optionally re-submit the form for the user here
    // or let them click the button again.
  };

  // If user is already logged in, redirect to dashboard
  if (session) {
    navigate('/dashboard');
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">MCA Sales CRM</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to continue</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900/50 shadow-md rounded-lg p-8">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-light-text dark:text-dark-text">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || !!message}
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={loading} disabled={loading || !!message}>
                  <Icons.Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </Button>
              </div>
            </form>
          </div>
          
          {message && (
            <div className="mt-4 text-center text-sm text-green-600 dark:text-green-400 p-3 bg-green-100 dark:bg-green-900/50 rounded-md">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 text-center text-sm text-red-600 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/50 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
      {showConfigModal && (
        <ConfigModal 
          onConfigured={handleConfigured} 
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </>
  );
};

export default LoginPage;
