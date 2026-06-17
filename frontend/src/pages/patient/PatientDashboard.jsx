import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { CalendarHeart, Clock, FileText, Bell, Activity, PlusCircle, LayoutDashboard, Calendar, User, LogOut } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const PatientDashboard = () => {
  const { profile, user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentAppointments = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'appointments'),
          where('patientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const apps = [];
        snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
        setAppointments(apps);
      } catch (error) {
        console.error('Error fetching dashboard appointments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentAppointments();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const stats = [
    { label: 'Upcoming Visits', value: appointments.filter(a => a.appointmentStatus === 'scheduled').length, icon: <CalendarHeart className="text-primary" size={24} />, bg: 'bg-blue-50' },
    { label: 'Completed Visits', value: appointments.filter(a => a.appointmentStatus === 'completed').length, icon: <Activity className="text-emerald-500" size={24} />, bg: 'bg-emerald-50' },
    { label: 'Prescriptions', value: '0', icon: <FileText className="text-purple-500" size={24} />, bg: 'bg-purple-50' },
    { label: 'Notifications', value: '2', icon: <Bell className="text-amber-500" size={24} />, bg: 'bg-amber-50' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
      {/* Sidebar Menu */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
          <div className="mb-6 px-4">
            <h3 className="font-bold text-slate-800">Patient Menu</h3>
          </div>
          <nav className="space-y-1">
            <Link to="/patient-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-semibold transition-colors">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/book-appointment" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors font-medium">
              <PlusCircle size={20} />
              <span>Book Appointment</span>
            </Link>
            <Link to="/my-appointments" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors font-medium">
              <Calendar size={20} />
              <span>My Appointments</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors font-medium">
              <User size={20} />
              <span>Profile</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium mt-4">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome Back, {profile?.name}!</h1>
            <p className="text-sm text-slate-500 mt-1">Here is a summary of your recent health activities.</p>
          </div>
          <Link 
            to="/book-appointment"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            <PlusCircle size={20} />
            <span>Book Consultation</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Appointments & Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Recent Appointments</h2>
              <Link to="/my-appointments" className="text-sm font-medium text-primary hover:underline">View All</Link>
            </div>
            
            {loading ? (
              <div className="py-12 flex justify-center"><LoadingSpinner /></div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 3).map(app => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold">
                        {app.selectedDate.split('-')[2]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Consultation</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock size={12} /> {app.selectedDate} at {app.selectedSlot}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.appointmentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        app.appointmentStatus === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.appointmentStatus}
                      </span>
                      <p className="text-xs font-semibold text-slate-700 mt-2">Token: {app.tokenNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <CalendarHeart className="mx-auto mb-3 opacity-20" size={48} />
                <p>No recent appointments found.</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-md p-6 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold mb-2">Need Immediate Care?</h2>
              <p className="text-sm text-blue-100 leading-relaxed mb-6">Our specialists are available for consultation. Book a slot today to receive personalized care.</p>
            </div>
            <Link 
              to="/book-appointment"
              className="w-full py-3 bg-white text-primary text-center rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Find a Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
