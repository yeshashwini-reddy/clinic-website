import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

/**
 * Footer for the clinic website.
 * Uses the premium palette defined in index.css.
 */
const Footer = () => {
  return (
    <footer className="bg-primary text-white py-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="text-center md:text-left mb-4 md:mb-0">
          © {new Date().getFullYear()} Vanitha Clinic. All rights reserved.
        </div>
        <nav className="flex space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/services" className="hover:underline">Services</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/doctors" className="hover:underline">Doctors</Link>
        </nav>
        <div className="flex items-center mt-2 md:mt-0">
          <Heart className="w-5 h-5 mr-1" /> Made with care
        </div>
      </div>
    </footer>
  );
};

export default Footer;
