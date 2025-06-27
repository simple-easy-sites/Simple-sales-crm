import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../constants';

// Icon removed as per request

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errorMessage = await login(email, password); 
    if (errorMessage) {
      setError(errorMessage); // Display the real error from Supabase
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
        <div>
          {/* Icon removed */}
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your registered email and password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
          <Input
            id="email" // Changed from username to email
            label="Email address" // Changed label
            name="email"
            type="email" // Changed type to email
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
          <Input
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <div>
            <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
              Sign in
            </Button>
          </div>
        </form>
         {/* Removed hardcoded demo accounts as authentication is now via Supabase
         <div className="mt-6 text-sm text-gray-500 text-center">
            <p className="font-medium text-gray-700">Demo accounts:</p>
            <p>Username: <span className="font-semibold">agent1</span> / Password: <span className="font-semibold">password123</span></p>
            <p>Username: <span className="font-semibold">agent2</span> / Password: <span className="font-semibold">password456</span></p>
          </div>
          */}
          <p className="mt-4 text-center text-xs text-gray-500">
            New user? You might need to sign up via a Supabase interface or a dedicated sign-up page (not yet implemented in this app).
          </p>
      </div>
    </div>
  );
};
