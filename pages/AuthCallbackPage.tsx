import React from 'react';
import { Icons } from '../components/ui/Icons';

const AuthCallbackPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <Icons.Spinner className="h-10 w-10 animate-spin text-brand-blue mb-4" />
      <h1 className="text-xl font-semibold">Authenticating...</h1>
      <p className="text-slate-500 dark:text-slate-400">Please wait while we securely log you in.</p>
    </div>
  );
};

export default AuthCallbackPage;