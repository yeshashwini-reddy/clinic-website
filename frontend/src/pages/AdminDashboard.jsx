import React, { useEffect, useState } from 'react';
import { collection } from 'firebase/firestore';
import { db } from '../firebase';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertCircle, LayoutDashboard, Stethoscope, CalendarCheck, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDocsWithTimeout } from '../utils/firestoreHelper';

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const AdminDashboard = () => {
  const [stats, setStats] = useState({ doctors: 0, appointments: 0, patients: 0, revenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const [docSnap, appSnap, patSnap, paySnap] = await Promise.all([
          getDocsWithTimeout(collection(db, 'doctors')),
          getDocsWithTimeout(collection(db, 'appointments')),
          getDocsWithTimeout(collection(db, 'users')).then(snap => snap.docs.filter(d => d.data().role === 'patient')),
          getDocsWithTimeout(collection(db, 'payments'))
        ]);
        
        // Deduplicate doctors by name
        const uniqueDoctors = new Set();
        docSnap.docs.forEach(d => {
          if (d.data().name) uniqueDoctors.add(d.data().name);
        });

        // Setup base chart data for days of the week
        const daysMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
        const tempChartData = [
          { name: 'Mon', appointments: 0, revenue: 0 },
          { name: 'Tue', appointments: 0, revenue: 0 },
          { name: 'Wed', appointments: 0, revenue: 0 },
          { name: 'Thu', appointments: 0, revenue: 0 },
          { name: 'Fri', appointments: 0, revenue: 0 },
          { name: 'Sat', appointments: 0, revenue: 0 },
          { name: 'Sun', appointments: 0, revenue: 0 },
        ];

        // Process appointments for charts
        appSnap.docs.forEach(d => {
          const data = d.data();
          if (data.selectedDate) {
             const dObj = new Date(data.selectedDate);
             if (!isNaN(dObj)) {
                const dayStr = daysMap[dObj.getDay()];
                const dayItem = tempChartData.find(item => item.name === dayStr);
                if (dayItem) dayItem.appointments += 1;
             }
          }
        });

        // Calculate dynamic revenue and chart revenue from payments
        let totalRevenue = 0;
        paySnap.docs.forEach(d => {
          const data = d.data();
          const amount = Number(data.amount || 0);
          totalRevenue += amount;
          
          // Find the related appointment to sync revenue with the booking date
          const relatedApp = appSnap.docs.find(app => app.id === data.appointmentId);
          const appDateStr = relatedApp ? relatedApp.data().selectedDate : null;

          if (appDateStr) {
             const dObj = new Date(appDateStr);
             if (!isNaN(dObj)) {
                const dayStr = daysMap[dObj.getDay()];
                const dayItem = tempChartData.find(item => item.name === dayStr);
                if (dayItem) dayItem.revenue += amount;
             }
          } else if (data.createdAt) {
             const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
             if (!isNaN(dateObj)) {
                const dayStr = daysMap[dateObj.getDay()];
                const dayItem = tempChartData.find(item => item.name === dayStr);
                if (dayItem) dayItem.revenue += amount;
             }
          }
        });

        setChartData(tempChartData);
        setStats({
          doctors: uniqueDoctors.size,
          appointments: appSnap.size,
          patients: patSnap.length,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Could not connect to database or query collections. Please check your credentials or rules.');
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 font-medium">Loading statistics and data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <LayoutDashboard className="text-primary" size={28} />
          <span>Admin Dashboard</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Global clinic analytics and configuration control panel</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600 inline-flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Analytics Retrieval Failed</h3>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Cards Row */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard 
              title="Registered Doctors" 
              value={stats.doctors} 
              icon={<Stethoscope className="text-primary" size={24} />} 
              bgColor="bg-blue-50"
            />
            <StatCard 
              title="Total Patients" 
              value={stats.patients} 
              icon={<Users className="text-indigo-500" size={24} />} 
              bgColor="bg-indigo-50"
            />
            <StatCard 
              title="Total Appointments" 
              value={stats.appointments} 
              icon={<CalendarCheck className="text-emerald-500" size={24} />} 
              bgColor="bg-emerald-50"
            />
            <StatCard 
              title="Revenue" 
              value={`₹${(stats.revenue / 1000).toFixed(1)}K`} 
              icon={<CreditCard className="text-purple-500" size={24} />} 
              bgColor="bg-purple-50"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Daily Appointments</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Weekly Revenue (₹)</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 mt-6">
            <h2 className="text-xl font-bold text-slate-800">Quick Administrative Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link 
                to="/admin/doctors" 
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 border border-slate-100 rounded-xl transition-all font-semibold text-slate-700 hover:text-primary"
              >
                <span>Manage Doctors Directory</span>
                <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full font-medium">Go</span>
              </Link>
              <Link 
                to="/admin/appointments" 
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 border border-slate-100 rounded-xl transition-all font-semibold text-slate-700 hover:text-emerald-600"
              >
                <span>Manage Scheduled Bookings</span>
                <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full font-medium">Go</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
