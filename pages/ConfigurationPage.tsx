import React, { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface ConfigurationPageProps {
  onConfigured: (url: string, key: string) => void;
}

const ConfigurationPage: React.FC<ConfigurationPageProps> = ({ onConfigured }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url || !key) {
      setError('Both URL and Key are required.');
      return;
    }
    
    try {
        new URL(url);
    } catch (_) {
        setError('Please enter a valid Supabase Project URL.');
        return;
    }

    setIsLoading(true);

    // Simulate a quick save and transition
    setTimeout(() => {
        onConfigured(url, key);
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">One-Time Setup</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your Supabase credentials to use the CRM.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900/50 shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="supabase-url" className="text-sm font-medium text-light-text dark:text-dark-text">
                  Supabase Project URL
                </label>
                <Input
                  id="supabase-url"
                  type="url"
                  placeholder="https://your-project-ref.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-describedby="url-hint"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="supabase-key" className="text-sm font-medium text-light-text dark:text-dark-text">
                  Supabase Anon (Public) Key
                </label>
                <Input
                  id="supabase-key"
                  type="text"
                  placeholder="ey...your-anon-key...sA"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-describedby="key-hint"
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
                 Save & Continue
              </Button>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="mt-4 text-center text-sm text-red-600 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/50 rounded-md" role="alert">
            {error}
          </div>
        )}
         <p id="url-hint" className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center">
            You can find these in your Supabase project under Settings &gt; API. Your credentials will be stored securely in your browser's local storage.
        </p>
      </div>
    </div>
  );
};

export default ConfigurationPage;