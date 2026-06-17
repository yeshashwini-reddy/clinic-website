import React from 'react';
import { FileText, PlusCircle } from 'lucide-react';

const DoctorPrescriptions = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="text-indigo-600" size={28} />
            <span>Prescription Center</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and issue digital prescriptions to your patients</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm">
          <PlusCircle size={18} />
          <span>New Prescription</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-4">
          <FileText size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Active Prescriptions</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You haven't issued any digital prescriptions recently. When you write prescriptions for your patients, they will securely appear here for future reference and tracking.
        </p>
        <button className="mt-8 flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold transition-colors">
          <PlusCircle size={18} />
          <span>Write First Prescription</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;
