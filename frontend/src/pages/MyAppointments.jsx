import React, { useEffect, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AppointmentCard from '../components/AppointmentCard';
import { AlertCircle, Calendar, WifiOff } from 'lucide-react';
import { getDocsWithTimeout } from '../utils/firestoreHelper';

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsOffline(false);
        const q = query(collection(db, 'appointments'), where('patientId', '==', user.uid));
        const snap = await getDocsWithTimeout(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(data);
        if (snap._fromCache) {
          setIsOffline(true);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(`Failed to fetch appointments: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-slate-600 font-medium">Please log in to view your appointments.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 font-medium">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Appointments</h1>
        <p className="text-sm text-slate-500 mt-1">Review status and timings for your scheduled clinic visits</p>
      </div>

      {/* Offline / Cache Warning Banner */}
      {isOffline && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-3.5 text-sm shadow-sm">
          <WifiOff size={18} className="shrink-0 text-amber-500" />
          <div>
            <span className="font-semibold">Viewing Offline Data — </span>
            <span className="text-amber-700">Could not connect to the server. Showing your locally saved appointments.</span>
          </div>
        </div>
      )}

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600 inline-flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Fetch Failed</h3>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="p-3 bg-slate-200/50 rounded-2xl text-slate-500 inline-flex items-center justify-center">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Appointments Scheduled</h3>
          <p className="text-sm text-slate-500">You don't have any appointments currently scheduled.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map(app => (
            <AppointmentCard key={app.id} appointment={app} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;

