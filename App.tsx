
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
// import { CreateMerchantPage } from './pages/CreateMerchantPage'; // Removed
import { MerchantDetailPage } from './pages/MerchantDetailPage';
import { AddLeadMerchantPage } from './pages/AddLeadMerchantPage'; 
import { TestSupabasePage } from './pages/test-supabase';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROUTES } from './constants';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/test-supabase" element={<TestSupabasePage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                {/* <Route path={ROUTES.CREATE_MERCHANT} element={<CreateMerchantPage />} /> Removed */}
                <Route path={ROUTES.ADD_MERCHANT} element={<AddLeadMerchantPage />} /> {/* Updated route */}
                <Route path={ROUTES.MERCHANT_DETAIL} element={<MerchantDetailPage />} />
              </Route>
              {/* Fallback route: redirects to Dashboard if no other route matches */}
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </main>
          <footer className="bg-white text-center p-4 text-sm text-gray-500 border-t border-gray-200">
            © {new Date().getFullYear()} Sales CRM. All rights reserved.
          </footer>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
