import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout component wraps page content with persistent Navbar and Footer.
 * Landing page ("/") gets full-width layout (no container constraint).
 * All other pages get a padded, max-width container.
 */
const Layout = ({ children, hideFooter }) => {
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const isLanding = pathname === '/';

  // Force admins to stay in the admin interface
  if (profile?.role === 'admin' && !pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  // Force doctors to stay in the doctor interface
  if (profile?.role === 'doctor' && !pathname.startsWith('/doctor')) {
    return <Navigate to="/doctor" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-theme-bg">
      <Navbar />
      {isLanding ? (
        <main className="flex-grow pt-16">
          {children}
        </main>
      ) : (
        <main className="flex-grow pt-24 pb-12 container mx-auto px-4 max-w-7xl">
          {children}
        </main>
      )}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
