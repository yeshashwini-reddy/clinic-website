import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import LoginRegister from './pages/LoginRegister.jsx';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ManageDoctors from './pages/ManageDoctors';
import ManageAppointments from './pages/ManageAppointments';
import ManagePatients from './pages/ManagePatients';
import ManagePayments from './pages/ManagePayments';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Services from './pages/Services';
import LandingPage from './pages/LandingPage';
import Contact from './pages/Contact';
import Pharmacy from './pages/Pharmacy';

import Layout from './components/Layout';

import AdminLayout from './components/AdminLayout';
import DoctorLayout from './components/DoctorLayout';
import PatientLayout from './components/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientPayments from './pages/patient/PatientPayments';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';

// Private route guard
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  // Only block rendering while Firebase auth hasn't responded yet AND we have no user
  if (loading && !user) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-primary rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) return <Navigate to="/login" replace />;
  return children;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  return (
    <>
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginRegister /></Layout>} />
        
        {/* New Login Routes (Removed, using unified /login) */}
        
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/pharmacy" element={<Layout><Pharmacy /></Layout>} />
        <Route path="/doctors" element={<Layout><Doctors /></Layout>} />

        {/* Existing Flat Protected Routes */}
        <Route path="/book-appointment" element={<PrivateRoute><Layout><BookAppointment /></Layout></PrivateRoute>} />
        <Route path="/my-appointments" element={<PrivateRoute><Layout><MyAppointments /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        
        {/* New Dashboards */}
        <Route path="/patient-dashboard" element={<PrivateRoute allowedRoles={['patient', 'admin']}><Layout><PatientDashboard /></Layout></PrivateRoute>} />

        {/* Doctor Routes */}
        <Route path="/doctor" element={<PrivateRoute allowedRoles={['doctor']}><DoctorLayout><DoctorDashboard /></DoctorLayout></PrivateRoute>} />
        <Route path="/doctor/appointments" element={<PrivateRoute allowedRoles={['doctor']}><DoctorLayout><DoctorAppointments /></DoctorLayout></PrivateRoute>} />
        <Route path="/doctor/patients" element={<PrivateRoute allowedRoles={['doctor']}><DoctorLayout><DoctorPatients /></DoctorLayout></PrivateRoute>} />
        <Route path="/doctor/prescriptions" element={<PrivateRoute allowedRoles={['doctor']}><DoctorLayout><DoctorPrescriptions /></DoctorLayout></PrivateRoute>} />
        <Route path="/doctor/profile" element={<PrivateRoute allowedRoles={['doctor']}><DoctorLayout><Profile /></DoctorLayout></PrivateRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/doctors" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><ManageDoctors /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/appointments" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><ManageAppointments /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/patients" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><ManagePatients /></AdminLayout></PrivateRoute>} />
        <Route path="/admin/payments" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><ManagePayments /></AdminLayout></PrivateRoute>} />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
