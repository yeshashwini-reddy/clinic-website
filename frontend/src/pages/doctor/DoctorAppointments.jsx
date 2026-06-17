import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorAppointments = ({ doctorId }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !doctorId) return;
    setLoading(true);

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = [];
      snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
      
      // Sort by date and slot
      apps.sort((a, b) => {
        if (a.selectedDate === b.selectedDate) return a.selectedSlot.localeCompare(b.selectedSlot);
        return a.selectedDate.localeCompare(b.selectedDate);
      });
      
      setAppointments(apps);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching appointments:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, doctorId]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { appointmentStatus: status });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manage Appointments</h1>
        <p className="text-sm text-slate-500 mt-1">View and update appointment statuses.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner /></div>
        ) : appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Token</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-indigo-700">
                      {app.tokenNumber}
                    </td>
                    <td className="px-6 py-4">
                      {app.selectedDate} <br/>
                      <span className="text-xs text-slate-400">{app.selectedSlot}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {app.patientId ? `PT-${app.patientId.slice(0,6).toUpperCase()}` : 'GUEST'}
                    </td>
                    <td className="px-6 py-4 uppercase text-xs font-bold text-slate-500">
                      {app.paymentStatus}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        app.appointmentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        app.appointmentStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {app.appointmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {app.appointmentStatus === 'scheduled' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateStatus(app.id, 'completed')}
                            className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                            title="Mark Completed"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <CalendarCheck className="mx-auto mb-4 text-slate-300" size={64} />
            <h3 className="text-lg font-bold text-slate-800">No Appointments</h3>
            <p className="text-sm text-slate-500 mt-2">You don't have any appointments scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
