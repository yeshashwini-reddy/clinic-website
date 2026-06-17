import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => setOpen(!open);

    return (
      <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-80 backdrop-blur-md shadow-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary">
            <img src="/assets/logo.png" alt="Vanitha Clinic logo" className="h-8 w-auto" />
            <span className="text-xl font-semibold tracking-wide">Vanitha Clinic</span>
          </Link>
          {/* Mobile menu button */}
          <button className="md:hidden text-gray-600" onClick={toggleMenu} aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          {/* Desktop menu */}
          <ul className="hidden md:flex space-x-6 items-center">
            <li><Link to="/home" className="text-gray-700 hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/about" className="text-gray-700 hover:text-primary transition-colors">About</Link></li>
            <li><Link to="/services" className="text-gray-700 hover:text-primary transition-colors">Services</Link></li>
            <li><Link to="/pharmacy" className="text-gray-700 hover:text-primary transition-colors">Pharmacy</Link></li>
            <li><Link to="/doctors" className="text-gray-700 hover:text-primary transition-colors">Doctors</Link></li>
            <li><Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">Contact</Link></li>
            {isAuthenticated && profile?.role === 'patient' && (
              <> 
                <li><Link to="/patient-dashboard" className="text-gray-700 hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link to="/book-appointment" className="text-gray-700 hover:text-primary transition-colors">Book Appointment</Link></li>
                <li><Link to="/my-appointments" className="text-gray-700 hover:text-primary transition-colors">My Appointments</Link></li>
              </>
            )}
            {isAuthenticated && profile?.role === 'doctor' && (
              <li><Link to="/doctor-dashboard" className="text-gray-700 hover:text-primary transition-colors">Doctor Dashboard</Link></li>
            )}
            {isAuthenticated && profile?.role === 'admin' && (
              <li><Link to="/admin" className="text-gray-700 hover:text-primary transition-colors">Admin Dashboard</Link></li>
            )}
            {isAuthenticated ? (
              <li><button onClick={handleLogout} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Logout</button></li>
            ) : (
              <li><Link to="/login" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Login / Register</Link></li>
            )}
          </ul>
          {/* Mobile menu (collapsed) */}
          {open && (
            <ul className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden flex flex-col space-y-2 py-4 px-6">
              <li><Link to="/home" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary">Home</Link></li>
              <li><Link to="/about" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary">About</Link></li>
              <li><Link to="/services" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary">Services</Link></li>
              <li><Link to="/pharmacy" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary">Pharmacy</Link></li>
              <li><Link to="/doctors" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary">Doctors</Link></li>
              <li><Link to="/contact" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary">Contact</Link></li>
              {isAuthenticated && profile?.role === 'patient' && (
                <> 
                  <li><Link to="/patient-dashboard" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary">Dashboard</Link></li>
                  <li><Link to="/book-appointment" className="block text-gray-700 hover:text-primary">Book Appointment</Link></li>
                  <li><Link to="/my-appointments" className="block text-gray-700 hover:text-primary">My Appointments</Link></li>
                </>
              )}
              {isAuthenticated && profile?.role === 'doctor' && (
                <li><Link to="/doctor-dashboard" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary">Doctor Dashboard</Link></li>
              )}
              {isAuthenticated && profile?.role === 'admin' && (
                <li><Link to="/admin" className="block text-gray-700 hover:text-primary">Admin Dashboard</Link></li>
              )}
              {isAuthenticated ? (
                <li><button onClick={handleLogout} className="w-full text-left text-gray-700 hover:text-primary">Logout</button></li>
              ) : (
                <li><Link to="/login" className="block text-gray-700 hover:text-primary">Login / Register</Link></li>
              )}
            </ul>
          )}
        </div>
      </nav>
    );
};

export default Navbar;
