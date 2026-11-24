import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import MedicinesPage from './pages/MedicinesPage';
import MedicineDetailPage from './pages/MedicineDetailPage';
import PharmaciesPage from './pages/PharmaciesPage';
import PharmacyDetailPage from './pages/PharmacyDetailPage';
import UserDashboardPage from './pages/UserDashboardPage';
import PharmacyDashboardPage from './pages/PharmacyDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VivaGuidePage from './pages/VivaGuidePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white">
          {/* Notification Toast Provider */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '13px',
                borderRadius: '14px',
                padding: '12px 18px',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#0ea5e9',
                  secondary: '#0f172a',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#0f172a',
                },
              },
            }}
          />

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/medicines" element={<MedicinesPage />} />
              <Route path="/medicines/:id" element={<MedicineDetailPage />} />
              <Route path="/pharmacies" element={<PharmaciesPage />} />
              <Route path="/pharmacies/:id" element={<PharmacyDetailPage />} />
              <Route path="/viva-guide" element={<VivaGuidePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Customer Routes */}
              <Route
                path="/my-reservations"
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Pharmacy Partner Routes */}
              <Route
                path="/pharmacy-dashboard"
                element={
                  <ProtectedRoute requirePharmacy={true}>
                    <PharmacyDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
