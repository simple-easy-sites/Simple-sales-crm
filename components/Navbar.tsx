import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants';
import { Button } from './ui/Button';

// CrmIcon removed as per request

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="bg-background text-foreground shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={ROUTES.DASHBOARD} className="flex items-center space-x-2 text-xl font-bold text-primary-700 hover:text-primary-900 transition-colors">
            {/* CrmIcon removed */}
            <span>Sales CRM</span>
          </Link>
          {currentUser && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {currentUser.username}</span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-primary-700 hover:bg-gray-100">
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};