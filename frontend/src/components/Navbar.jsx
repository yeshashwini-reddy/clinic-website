import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => setOpen(!open);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      scrolled 
        ? 'bg-theme-navbar-scrolled backdrop-blur-md shadow-md border-theme-border py-1.5' 
        : 'bg-theme-navbar backdrop-blur-md shadow-sm border-theme-border py-3'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-primary hover:scale-[1.02] active:scale-95 transition-all duration-300">
          <img src="/assets/logo.png" alt="Vanitha Clinic logo" className="h-8 w-auto" />
          <span className="text-xl font-semibold tracking-wide">Vanitha Clinic</span>
        </Link>
        {/* Mobile menu button */}
        <button className="md:hidden text-gray-600 hover:scale-110 active:scale-95 transition-transform" onClick={toggleMenu} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        {/* Desktop menu */}
        <ul className="hidden md:flex space-x-6 items-center">
          <li><Link to="/home" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Home</Link></li>
          <li><Link to="/about" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">About</Link></li>
          <li><Link to="/services" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Services</Link></li>
          <li><Link to="/pharmacy" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Pharmacy</Link></li>
          <li><Link to="/doctors" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Doctors</Link></li>
          <li><Link to="/contact" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Contact</Link></li>
          <li>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              <div
                className="transition-transform duration-500 ease-in-out"
                style={{ transform: theme === 'dark' ? 'rotate(360deg)' : 'rotate(0deg)' }}
              >
                {theme === 'light' ? '☀️' : '🌙'}
              </div>
            </button>
          </li>
          {isAuthenticated && profile?.role === 'patient' && (
            <> 
              <li><Link to="/patient-dashboard" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Dashboard</Link></li>
              <li><Link to="/book-appointment" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Book Appointment</Link></li>
              <li><Link to="/my-appointments" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">My Appointments</Link></li>
            </>
          )}
          {isAuthenticated && profile?.role === 'doctor' && (
            <li><Link to="/doctor-dashboard" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Doctor Dashboard</Link></li>
          )}
          {isAuthenticated && profile?.role === 'admin' && (
            <li><Link to="/admin" className="text-gray-700 hover:text-primary transition-colors nav-link-underline">Admin Dashboard</Link></li>
          )}
          {isAuthenticated ? (
            <li><button onClick={handleLogout} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300">Logout</button></li>
          ) : (
            <li><Link to="/login" className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300">Login / Register</Link></li>
          )}
        </ul>
        {/* Mobile menu (collapsed) */}
        {open && (
          <ul className="absolute top-full left-0 w-full bg-theme-card border-b border-theme-border shadow-lg md:hidden flex flex-col space-y-2 py-4 px-6">
            <li><Link to="/home" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Home</Link></li>
            <li><Link to="/about" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">About</Link></li>
            <li><Link to="/services" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Services</Link></li>
            <li><Link to="/pharmacy" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Pharmacy</Link></li>
            <li><Link to="/doctors" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Doctors</Link></li>
            <li><Link to="/contact" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Contact</Link></li>
            <li className="py-2 flex items-center justify-between border-t border-theme-border mt-2">
              <span className="text-gray-700 font-medium">Theme Mode</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95"
                aria-label="Toggle theme"
              >
                <div
                  className="transition-transform duration-500 ease-in-out"
                  style={{ transform: theme === 'dark' ? 'rotate(360deg)' : 'rotate(0deg)' }}
                >
                  {theme === 'light' ? '☀️' : '🌙'}
                </div>
              </button>
            </li>
            {isAuthenticated && profile?.role === 'patient' && (
              <> 
                <li><Link to="/patient-dashboard" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Dashboard</Link></li>
                <li><Link to="/book-appointment" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Book Appointment</Link></li>
                <li><Link to="/my-appointments" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">My Appointments</Link></li>
              </>
            )}
            {isAuthenticated && profile?.role === 'doctor' && (
              <li><Link to="/doctor-dashboard" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Doctor Dashboard</Link></li>
            )}
            {isAuthenticated && profile?.role === 'admin' && (
              <li><Link to="/admin" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Admin Dashboard</Link></li>
            )}
            {isAuthenticated ? (
              <li><button onClick={() => { handleLogout(); setOpen(false); }} className="w-full text-left text-gray-700 hover:text-primary py-1">Logout</button></li>
            ) : (
              <li><Link to="/login" onClick={() => setOpen(false)} className="block text-gray-700 hover:text-primary py-1">Login / Register</Link></li>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
