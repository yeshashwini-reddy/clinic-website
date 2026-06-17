import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download } from 'lucide-react';

const PatientPrescriptions = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Prescriptions</h1>
        <p className="text-sm text-slate-500 mt-1">View and download your digital prescriptions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <FileText className="mx-auto mb-4 text-slate-300" size={64} />
        <h3 className="text-lg font-bold text-slate-800">No Prescriptions Yet</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          After you complete a consultation, your doctor's prescriptions will appear here for you to view and download.
        </p>
      </div>
    </div>
  );
};

export default PatientPrescriptions;
