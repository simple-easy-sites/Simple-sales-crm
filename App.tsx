import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { loadSupabaseFromStorage } from './services/supabase';
import AuthCallbackPage from './pages/AuthCallbackPage';

function App(): React.ReactNode {
  useEffect(() => {
    // On initial load, try to configure Supabase from localStorage.
    // This is non-blocking and allows the app to start immediately.
    loadSupabaseFromStorage();
  }, []);

  return (
    <HashRouter>
      <AuthProvider>
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen font-sans antialiased">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth-callback" element={<AuthCallbackPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;