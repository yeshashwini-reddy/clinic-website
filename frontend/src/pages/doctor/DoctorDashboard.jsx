import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, CalendarCheck, Clock, CheckCircle, LayoutDashboard, FileText, User, LogOut } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import DoctorAppointments from './DoctorAppointments';

const DoctorDashboard = () => {
  const { user, profile, logout } = useAuth();
  const [stats, setStats] = useState({ today: 0, upcoming: 0, completed: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [actualDoctorId, setActualDoctorId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe = null;
    const fetchDashboardData = async () => {
      if (!user || !profile) return;
      try {
        // Step 1: Get the correct document ID from the 'doctors' collection matching the user's name
        let doctorDocId = null;
        const docQuery = query(collection(db, 'doctors'), where('name', '==', profile.name));
        const docSnap = await getDocs(docQuery);
        
        if (!docSnap.empty) {
          doctorDocId = docSnap.docs[0].id;
          setActualDoctorId(doctorDocId);
        } else {
          // Fallback if exactly matching name isn't found (e.g. Vanitha vs Dr. Vanitha)
          const allDocs = await getDocs(collection(db, 'doctors'));
          const match = allDocs.docs.find(d => d.data().name.includes(profile.name) || profile.name.includes(d.data().name));
          if (match) {
            doctorDocId = match.id;
            setActualDoctorId(doctorDocId);
          } else {
            console.warn("Doctor profile not found in doctors collection!");
            setLoading(false);
            return;
          }
        }

        // Step 2: Query appointments using the correct doctorDocId
        const localDate = new Date();
        const todayStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
        
        const q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctorDocId)
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          let todayCount = 0;
          let upcomingCount = 0;
          let completedCount = 0;
          const recentApps = [];

          snapshot.forEach(doc => {
            const data = doc.data();
            const isActive = data.appointmentStatus !== 'completed' && data.appointmentStatus !== 'cancelled';
            
            // Count all of today's appointments (except cancelled) for the Today stat
            if (data.selectedDate === todayStr && data.appointmentStatus !== 'cancelled') todayCount++;
            
            // Upcoming should be strictly future dates OR today's active appointments
            if (data.selectedDate > todayStr && isActive) upcomingCount++;
            if (data.selectedDate === todayStr && isActive) upcomingCount++; 

            if (data.appointmentStatus === 'completed') completedCount++;
            
            if (data.selectedDate >= todayStr && isActive) {
              recentApps.push({ id: doc.id, ...data });
            }
          });

          // Sort upcoming apps by date/time
          recentApps.sort((a, b) => {
            if (a.selectedDate === b.selectedDate) return a.selectedSlot.localeCompare(b.selectedSlot);
            return a.selectedDate.localeCompare(b.selectedDate);
          });

          setStats({ today: todayCount, upcoming: upcomingCount, completed: completedCount });
          setAppointments(recentApps.slice(0, 5));
          setLoading(false);
        }, (err) => {
          console.error('Error fetching real-time doctor stats:', err);
          setLoading(false);
        });

      } catch (err) {
        console.error('Error in doctor dashboard setup:', err);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, profile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
      {/* Sidebar Menu */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
          <div className="mb-6 px-4">
            <h3 className="font-bold text-slate-800">Doctor Menu</h3>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'appointments' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
              <CalendarCheck size={20} />
              <span>All Appointments</span>
            </button>
            <button onClick={() => setActiveTab('patients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'patients' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
              <Users size={20} />
              <span>Patients</span>
            </button>
            <button onClick={() => setActiveTab('prescriptions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'prescriptions' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
              <FileText size={20} />
              <span>Prescriptions</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
              <User size={20} />
              <span>Profile</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium mt-4">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        
        {activeTab === 'appointments' && (
           <DoctorAppointments doctorId={actualDoctorId} />
        )}

        {activeTab === 'patients' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Patient Directory</h2>
            <p className="text-slate-500 mt-2">Patient history and records will appear here.</p>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Prescription Management</h2>
            <p className="text-slate-500 mt-2">Create and view digital prescriptions for your patients here.</p>
            <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
              Create New Prescription
            </button>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 border border-indigo-100">
              <User size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{profile?.name || 'Doctor Profile'}</h2>
            <p className="text-slate-500 text-sm mt-1 mb-6">{profile?.email}</p>
            
            <div className="w-full max-w-md text-left space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Clinic Name</p>
                <p className="font-medium text-slate-700">Vanitha Clinic</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Role</p>
                <p className="font-medium text-slate-700 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Welcome, {profile?.name}</h1>
              <p className="text-sm text-slate-500 mt-1">Overview of your scheduled consultations.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 h-full">
                <div className="w-14 h-14 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <CalendarCheck size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500 truncate" title="Today's Appointments">Today's Appointments</p>
                  <p className="text-2xl font-bold text-slate-800 truncate">{loading ? '-' : stats.today}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 h-full">
                <div className="w-14 h-14 shrink-0 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <Clock size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500 truncate" title="Upcoming">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-800 truncate">{loading ? '-' : stats.upcoming}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 h-full">
                <div className="w-14 h-14 shrink-0 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500 truncate" title="Completed">Completed</p>
                  <p className="text-2xl font-bold text-slate-800 truncate">{loading ? '-' : stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">Upcoming Schedule</h2>
                <button onClick={() => setActiveTab('appointments')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">View All</button>
              </div>
              {loading ? (
                <div className="py-8 flex justify-center"><LoadingSpinner /></div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-800">Token: {app.tokenNumber}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                          <Clock size={14} /> {app.selectedDate} | {app.selectedSlot}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full uppercase">
                          {app.appointmentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <Users className="mx-auto mb-3 opacity-30" size={48} />
                  <p>No upcoming appointments found.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
