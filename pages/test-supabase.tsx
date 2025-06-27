
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export const TestSupabasePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: supabaseUser },
          error: getUserError,
        } = await supabase.auth.getUser();

        if (getUserError) {
          throw getUserError;
        }
        
        setUser(supabaseUser);

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const renderContent = () => {
    if (loading) {
        return <p className="text-gray-500">Loading...</p>;
    }
    if (error) {
        return <p className="text-red-500 font-semibold">Error: {error}</p>;
    }
    if (user) {
        return (
            <div>
              <p className="text-green-600 font-semibold">✅ Connected. You are logged in as:</p>
              <pre className="mt-2 bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </div>
        );
    }
    return <p className="font-semibold">No active user session found.</p>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-xl border border-border">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Supabase Connection Test</h1>
        <div className="mt-4">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};
