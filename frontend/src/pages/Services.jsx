import React from 'react';
import { Stethoscope, HeartPulse, Pill, Activity } from 'lucide-react';

const services = [
  { icon: <Stethoscope className="w-8 h-8 text-primary" />, title: 'General Check‑up', desc: 'Comprehensive medical checkups and preventative health counseling for patients of all ages.' },
  { icon: <HeartPulse className="w-8 h-8 text-emerald-500" />, title: 'Cardiology', desc: 'Expert cardiovascular consultations, diagnostic tracking, and customized cardiac care support.' },
  { icon: <Pill className="w-8 h-8 text-indigo-500" />, title: 'Pharmacy', desc: 'Direct access to pharmacy prescriptions, detailed consultations, and on-site dispensaries.' },
];

const Services = () => (
  <div className="container mx-auto max-w-7xl py-6 space-y-10">
    <div className="text-center space-y-4 max-w-2xl mx-auto">
      <span className="px-3 py-1 bg-blue-50 text-primary font-semibold text-xs rounded-full uppercase tracking-wider">
        Medical Specialties
      </span>
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
        <Activity className="text-primary animate-pulse" size={32} />
        <span>Our Services</span>
      </h1>
      <p className="text-slate-600 leading-relaxed text-base">
        Explore the specialized healthcare services provided by the registered medical professionals at Vanitha Clinic.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {services.map((s, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center hover:shadow-md transition-all duration-300 flex flex-col items-center space-y-4 relative overflow-hidden group"
        >
          {/* Accent bottom border on hover */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent group-hover:bg-primary transition-all duration-300" />
          
          <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            {s.icon}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">{s.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Services;
