import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const getRedirectURL = () => {
    // Use window.location.origin which is robust and works for any deployment.
    // It correctly determines the protocol and hostname for the callback.
    return `${window.location.origin}/#/auth-callback`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectURL(),
        }
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Check your email for the login link!'
      });
      setEmail('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred while sending the magic link.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-light-text dark:text-dark-text">
            MCA Sales CRM
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              label="Email address"
              disabled={loading}
            />
          </div>

          {message && (
            <div
              className={`rounded-md p-4 text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
              }`}
            >
              <p>{message.text}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
