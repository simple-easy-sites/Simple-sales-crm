import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface ConfigModalProps {
  onConfigured: (url: string, key: string) => void;
  onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ onConfigured, onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="w-full max-w-md bg-light-bg dark:bg-dark-bg rounded-lg shadow-xl m-4">
        <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Initial Setup Required</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your Supabase credentials to continue.</p>
            </div>
            
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
                {error && (
                  <div className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
                    {error}
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                       Save & Continue
                    </Button>
                </div>
              </div>
            </form>
             <p id="url-hint" className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center">
                You can find these in your Supabase project under Settings &gt; API. Your credentials will be stored in your browser's local storage.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
