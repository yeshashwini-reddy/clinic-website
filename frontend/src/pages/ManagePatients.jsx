import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, AlertCircle, Mail, Phone } from 'lucide-react';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'users'), where('role', '==', 'patient'));
        const querySnapshot = await getDocs(q);
        
        const patientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPatients(patientsData);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patient directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 font-medium">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Users className="text-indigo-500" size={32} />
            Patient Directory
          </h1>
          <p className="text-slate-500 mt-2">View and manage registered patient accounts.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {patients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Patients Found</h3>
            <p className="text-slate-500">There are no registered patients in the system yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient Details</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contact Info</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => {
                  const dateObj = patient.createdAt?.toDate ? patient.createdAt.toDate() : (patient.createdAt ? new Date(patient.createdAt) : null);
                  const formattedDate = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) : 'Unknown';

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            {patient.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{patient.name || 'Unnamed Patient'}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {patient.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          <span>{patient.email || 'N/A'}</span>
                        </div>
                        {patient.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} className="text-slate-400" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePatients;
