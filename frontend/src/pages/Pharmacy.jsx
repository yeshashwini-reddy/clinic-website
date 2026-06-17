import React from 'react';
import { Pill, Activity } from 'lucide-react';

const Pharmacy = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-primary">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Pill className="text-primary h-20 w-20" />
            <Activity className="text-secondary h-10 w-10 absolute -bottom-2 -right-2 bg-white rounded-full p-1" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Pharmacy</h1>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          Our integrated pharmacy services are currently under development. Soon, you will be able to order prescriptions and health products directly through our platform.
        </p>
        <div className="inline-block px-6 py-3 bg-primary/10 text-primary font-semibold rounded-full border border-primary/20 animate-pulse">
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;
