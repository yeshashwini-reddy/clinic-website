import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  FileText, 
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const DoctorLayout = ({ children }) => {
  const { pathname } = useLocation();
  const { logout, profile } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Safely format the doctor's name to ensure it starts with "Dr." exactly once
  const doctorBaseName = profile?.name?.replace(/^Dr\.?\s*/i, '') || '';
  const displayName = `Dr. ${doctorBaseName}`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/doctor', icon: <LayoutDashboard size={20} /> },
    { name: 'Appointments', path: '/doctor/appointments', icon: <CalendarCheck size={20} /> },
    { name: 'Patients', path: '/doctor/patients', icon: <Users size={20} /> },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: <FileText size={20} /> },
    { name: 'Profile', path: '/doctor/profile', icon: <User size={20} /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-indigo-900 text-indigo-100">
      <div className="p-6 border-b border-indigo-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">+</span>
          </div>
          Doctor Portal
        </h2>
        <p className="text-xs text-indigo-300 mt-2 truncate">{displayName}</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/doctor' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-indigo-900 shadow-md' 
                  : 'hover:bg-indigo-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-indigo-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-20 flex-shrink-0 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800">Doctor Portal</span>
          </div>
          <div className="flex-1 flex justify-end items-center">
            {/* Top right elements like profile avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-indigo-600 font-medium capitalize">{profile?.specialization || 'Doctor'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                {doctorBaseName.charAt(0) || 'D'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
