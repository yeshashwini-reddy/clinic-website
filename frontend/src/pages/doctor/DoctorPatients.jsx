import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorPatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      try {
        // Find unique patients who booked with this doctor
        const q = query(collection(db, 'appointments'), where('doctorId', '==', user.uid));
        const snapshot = await getDocs(q);
        const patientIds = new Set();
        snapshot.forEach(doc => {
          if (doc.data().patientId) patientIds.add(doc.data().patientId);
        });

        // Fetch their profiles (Mock implementation since we're using minimal auth here)
        const patientList = Array.from(patientIds).map(id => ({
          id,
          name: `Patient ${id.slice(0, 5)}`,
          status: 'Active'
        }));
        
        setPatients(patientList);
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Patients</h1>
        <p className="text-sm text-slate-500 mt-1">List of patients assigned to you.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {loading ? (
          <div className="py-8 flex justify-center"><LoadingSpinner /></div>
        ) : patients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {patients.map(p => (
              <div key={p.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold mb-3">
                  P
                </div>
                <h3 className="font-bold text-slate-800">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1">ID: PT-{p.id.slice(0,6).toUpperCase()}</p>
                <div className="mt-4">
                  <button className="text-sm text-primary font-bold hover:underline">View History</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <Users className="mx-auto mb-3 opacity-30" size={48} />
            <p>No patients found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
