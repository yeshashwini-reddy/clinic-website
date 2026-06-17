import React, { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import DoctorCard from '../components/DoctorCard';
import { AlertCircle, Users, RefreshCw } from 'lucide-react';
import doctorsData from '../data/doctors';
import { getDocsWithTimeout } from '../utils/firestoreHelper';

const DoctorSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-2/3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
    </div>
    <div className="h-10 bg-slate-200 rounded-xl w-full mt-4"></div>
  </div>
);

const Doctors = () => {
  const [doctors, setDoctors] = useState(() => 
    doctorsData.map((d, index) => ({ id: `local_doc_${index + 1}`, ...d }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = async () => {
    try {
      if (doctors.length === 0) {
        setLoading(true);
      }
      setError(null);
      let docs;
      try {
        let querySnapshot = await getDocsWithTimeout(collection(db, 'doctors'));
        docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const hasExactlyTwoDoctors = 
          docs.length === 2 && 
          docs.every(d => doctorsData.some(fd => 
            fd.name === d.name && 
            fd.image === d.image && 
            fd.specialization === d.specialization
          ));

        if (!hasExactlyTwoDoctors) {
          console.log('Synchronising doctors collection to the two fixed specialists...');
          for (const d of docs) {
            try {
              await deleteDoc(doc(db, 'doctors', d.id));
            } catch (deleteErr) {
              console.error(`Failed to delete obsolete doctor doc ${d.id}:`, deleteErr);
            }
          }
          for (const docData of doctorsData) {
            await addDoc(collection(db, 'doctors'), docData);
          }
          querySnapshot = await getDocsWithTimeout(collection(db, 'doctors'));
          docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (firestoreErr) {
        console.warn('Firestore fetch failed. Falling back to local static doctors list:', firestoreErr);
        docs = doctorsData.map((d, index) => ({ id: `local_doc_${index + 1}`, ...d }));
      }
      
      // Deduplicate by name if React Strict Mode caused double insertions
      const uniqueDocs = [];
      const seenNames = new Set();
      for (const d of docs) {
        if (!seenNames.has(d.name)) {
          seenNames.add(d.name);
          uniqueDocs.push(d);
        }
      }
      
      setDoctors(uniqueDocs.slice(0, 2));
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Unable to load doctors list. Please check your internet connection or Firebase setup.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);


  return (
    <div className="container mx-auto max-w-7xl py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Our Specialists</h1>
          <p className="text-sm text-slate-500 mt-1">Browse and book appointments with our medical professionals</p>
        </div>
        {error && (
          <button 
            onClick={fetchDoctors}
            className="flex items-center space-x-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm border border-slate-200"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <DoctorSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600 inline-flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Failed to Load Doctors</h3>
          <p className="text-sm text-slate-600">{error}</p>
          <button 
            onClick={fetchDoctors}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm hover:shadow"
          >
            Try Again
          </button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="p-3 bg-slate-200/50 rounded-2xl text-slate-500 inline-flex items-center justify-center">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Doctors Available</h3>
          <p className="text-sm text-slate-500">There are no doctors registered in the database at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
