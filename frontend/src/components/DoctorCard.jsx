import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, CalendarRange } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const handleBook = () => {
    navigate(`/book-appointment`, { state: { doctorId: doctor.id } });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top primary-gradient overlay strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 to-blue-500" />
      
      <div className="space-y-4">
        {/* Doctor Header with Image */}
        <div className="flex items-start space-x-4">
          {doctor.image ? (
            <img 
              src={doctor.image} 
              alt={doctor.name} 
              className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm"
              onError={(e) => {
                // Fallback if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-primary flex flex-col items-center justify-center border border-slate-100 shadow-sm"
            style={{ display: doctor.image ? 'none' : 'flex' }}
          >
            <span className="text-base font-extrabold tracking-wider">
              {doctor.name ? doctor.name.replace(/^Dr\.\s+/i, '').split(' ').map(n => n[0]).join('') : 'DR'}
            </span>
            <Stethoscope size={14} className="text-primary/60 mt-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight truncate">{doctor.name}</h3>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider truncate">
              {doctor.specialization}
            </p>
            <div className="mt-1 flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">₹{doctor.fee || 500}</span>
              <span>• Consultation Fee</span>
            </div>
          </div>
        </div>

        {/* Timings Details */}
        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 border border-slate-100 space-y-1">
          <p className="font-semibold text-slate-500 uppercase tracking-wide">Available Hours</p>
          <p className="font-medium text-slate-700">{doctor.timings || 'Mon - Fri: 9:00 AM - 5:00 PM'}</p>
        </div>
      </div>

      {/* Select Doctor Button */}
      <button 
        className="w-full mt-5 py-2.5 px-4 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        onClick={handleBook}
      >
        <CalendarRange size={16} />
        <span>Select Doctor</span>
      </button>
    </div>
  );
};

export default DoctorCard;

