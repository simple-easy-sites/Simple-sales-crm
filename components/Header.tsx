import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';

const Header: React.FC = () => {
    const { user, logout, session } = useAuth();

    return (
        <header className="bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold text-light-text dark:text-dark-text">MCA CRM</h1>
                <div className="flex items-center space-x-4">
                    {user && (
                        <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                            {user.email}
                        </span>
                    )}
                    <Button onClick={logout} variant="secondary" size="sm">
                        <Icons.LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;
