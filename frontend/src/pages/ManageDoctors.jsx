import React, { useEffect, useState } from 'react';
import { collection } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import DoctorCard from '../components/DoctorCard';
import { AlertCircle, Info } from 'lucide-react';
import { getDocsWithTimeout } from '../utils/firestoreHelper';
import doctorsData from '../data/doctors';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      let docsList;
      try {
        const snap = await getDocsWithTimeout(collection(db, 'doctors'));
        docsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (firestoreErr) {
        console.warn('Firestore fetch doctors failed. Falling back to local doctors list:', firestoreErr);
        docsList = doctorsData.map((d, index) => ({ id: `local_doc_${index + 1}`, ...d }));
      }
      
      const uniqueDocs = [];
      const seenNames = new Set();
      for (const d of docsList) {
        if (!seenNames.has(d.name)) {
          seenNames.add(d.name);
          uniqueDocs.push(d);
        }
      }
      
      setDoctors(uniqueDocs.slice(0, 2));
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch the doctors directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 font-medium">Loading doctors directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manage Doctors</h1>
          <p className="text-sm text-slate-500 mt-1">Admin Panel: Review clinic specialist directories</p>
        </div>
      </div>

      {/* Lock Notice */}
      <div className="p-4 mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl text-slate-700 text-xs flex items-start space-x-2.5 max-w-3xl">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">Clinic Configuration Locked</p>
          <p className="mt-0.5 text-slate-600">
            This Vanitha Clinic application is restricted to a small local clinic deployment with exactly two fixed specialist doctors: 
            <strong> Dr. Vanitha Reddy</strong> and <strong>Dr. Venugopal Reddy</strong>. 
            Adding or deleting medical provider profiles is disabled.
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600 inline-flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Database Connection Failed</h3>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl">
          {doctors.map(doctor => (
            <div key={doctor.id} className="relative">
              <DoctorCard doctor={doctor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
