import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Appointments from './pages/Appointments';
import Staff from './pages/Staff';
import Consultations from './pages/Consultations';
import Care from './pages/Care';
import Hospitalization from './pages/Hospitalization';
import Pharmacy from './pages/Pharmacy';
import Billing from './pages/Billing';
import Laboratory from './pages/Laboratory';
import Reports from './pages/Reports';
import Insurance from './pages/Insurance';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientProfile />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/care" element={<Care />} />
            <Route path="/hospitalization" element={<Hospitalization />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/laboratory" element={<Laboratory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/insurance" element={<Insurance />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;