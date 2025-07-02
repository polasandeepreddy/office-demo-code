import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { NewFileForm } from './components/forms/NewFileForm';
import { ValidationForm } from './components/forms/ValidationForm';
import { DataEntryForm } from './components/forms/DataEntryForm';
import { VerificationForm } from './components/forms/VerificationForm';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PropertyFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />

      {/* Form Routes */}
      <Route
        path="/new-file"
        element={user?.position === 'coordinator' ? <NewFileForm /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/validation/:fileId"
        element={user?.position === 'validator' ? <ValidationForm /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/data-entry/:fileId"
        element={user?.position === 'key-in' ? <DataEntryForm /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/verification/:fileId"
        element={user?.position === 'verification' ? <VerificationForm /> : <Navigate to="/dashboard" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
