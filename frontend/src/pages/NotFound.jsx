import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-4">
    <h1 className="text-8xl font-black text-slate-200 tracking-wider">404</h1>
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Page Not Found</h2>
      <p className="text-slate-500 max-w-sm text-sm">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
    </div>
    <Link 
      to="/" 
      className="inline-flex items-center space-x-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-dark shadow-md hover:shadow-lg transition-all text-sm"
    >
      <Home size={16} />
      <span>Go back Home</span>
    </Link>
  </div>
);

export default NotFound;
