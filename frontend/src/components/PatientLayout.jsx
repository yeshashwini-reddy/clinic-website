import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  CalendarHeart, 
  FileText, 
  CreditCard,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const PatientLayout = ({ children }) => {
  const { pathname } = useLocation();
  const { logout, profile } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/patient', icon: <LayoutDashboard size={20} /> },
    { name: 'Book Appointment', path: '/patient/book-appointment', icon: <CalendarPlus size={20} /> },
    { name: 'My Appointments', path: '/patient/appointments', icon: <CalendarHeart size={20} /> },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: <FileText size={20} /> },
    { name: 'Payments', path: '/patient/payments', icon: <CreditCard size={20} /> },
    { name: 'Profile', path: '/patient/profile', icon: <User size={20} /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-6 border-b border-slate-100 flex items-center justify-center">
        <Link to="/home" className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-xl">
          <img src="/assets/logo.png" alt="Vanitha Clinic" className="h-8 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/patient' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
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
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-20 flex-shrink-0 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800">My Dashboard</span>
          </div>
          <div className="flex-1 flex justify-end items-center">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{profile?.name}</p>
                <p className="text-xs text-slate-500">Patient ID: {profile?.id ? `PT-${profile.id.slice(0,6)}` : 'GUEST'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                {profile?.name?.charAt(0) || 'P'}
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

export default PatientLayout;
