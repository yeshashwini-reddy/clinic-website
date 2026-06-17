import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import AppointmentCard from '../components/AppointmentCard';
import { AlertCircle, CalendarRange, Trash2, WifiOff } from 'lucide-react';
import { getDocsWithTimeout } from '../utils/firestoreHelper';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);
      const snap = await getDocsWithTimeout(collection(db, 'appointments'));
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      if (snap._fromCache) {
        setIsOffline(true);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch the list of appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await deleteDoc(doc(db, 'appointments', id));
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Failed to delete appointment. Check Firestore rules.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { appointmentStatus: newStatus });
      setAppointments(prev => prev.map(a => (a.id === id ? { ...a, appointmentStatus: newStatus } : a)));
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update status. Check permissions.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 font-medium">Loading appointments dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manage Appointments</h1>
        <p className="text-sm text-slate-500 mt-1">Admin Panel: Track, approve, complete, or reschedule patient visits</p>
      </div>

      {/* Offline / Cache Warning Banner */}
      {isOffline && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-3.5 text-sm shadow-sm">
          <WifiOff size={18} className="shrink-0 text-amber-500" />
          <div>
            <span className="font-semibold">Viewing Offline Data — </span>
            <span className="text-amber-700">Could not connect to the server. Showing locally cached appointment records.</span>
          </div>
        </div>
      )}

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600 inline-flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Database Access Denied</h3>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="p-3 bg-slate-200/50 rounded-2xl text-slate-500 inline-flex items-center justify-center">
            <CalendarRange size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Appointments Booked</h3>
          <p className="text-sm text-slate-500">There are no appointments registered in the system currently.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map(app => (
            <AppointmentCard key={app.id} appointment={app}>
              
              {/* Status Manager Controls Overlay */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-semibold">STATUS:</span>
                  <select
                    value={app.appointmentStatus || app.status || 'scheduled'}
                    onChange={e => handleStatusChange(app.id, e.target.value)}
                    className="text-xs border border-slate-200 bg-slate-50 text-slate-700 font-semibold rounded-lg py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <button
                  onClick={() => handleDelete(app.id)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 p-2 rounded-xl transition-all"
                  title="Delete Appointment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </AppointmentCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
