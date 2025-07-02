
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-900/50 shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                            Welcome to your Dashboard!
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            This is your protected dashboard page. You are logged in as{' '}
                            <span className="font-semibold text-brand-blue">{user?.email}</span>.
                        </p>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">
                            CRM features will be built out here in the next phase.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
