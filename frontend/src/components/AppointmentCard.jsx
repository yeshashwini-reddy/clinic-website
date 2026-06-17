import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc } from 'firebase/firestore';
import { getDocWithTimeout } from '../utils/firestoreHelper';
import doctorsData from '../data/doctors';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Ticket,
  DollarSign
} from 'lucide-react';

// Simple static in-memory cache to prevent redundant N+1 query network calls
const doctorCache = {};

/**
 * Resolve doctor details from local static data first (instant),
 * falling back to Firestore as a background enhancement.
 */
const resolveLocalDoctor = (doctorId) => {
  return doctorsData.find((d, idx) =>
    doctorId === `local_doc_${idx + 1}` ||
    d.name === doctorId ||
    doctorId.includes(d.name) ||
    d.name.includes(doctorId)
  ) || null;
};

const AppointmentCard = ({ appointment, children }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      const doctorId = appointment.doctorId;
      if (!doctorId) {
        setLoading(false);
        return;
      }

      // 1. In-memory cache hit — instant
      if (doctorCache[doctorId]) {
        setDoctor(doctorCache[doctorId]);
        setLoading(false);
        return;
      }

      // 2. Local static data match — instant, no network
      const localMatch = resolveLocalDoctor(doctorId);
      if (localMatch) {
        doctorCache[doctorId] = localMatch;
        setDoctor(localMatch);
        setLoading(false);
        // Silently try Firestore in background to get richer data (e.g. updated fee/image)
        try {
          const snap = await getDocWithTimeout(doc(db, 'doctors', doctorId), 800);
          if (snap.exists()) {
            const enriched = snap.data();
            doctorCache[doctorId] = enriched;
            setDoctor(enriched);
          }
        } catch (_) { /* silent — local data is already shown */ }
        return;
      }

      // 3. Not in local list — try Firestore with timeout
      try {
        const snap = await getDocWithTimeout(doc(db, 'doctors', doctorId), 800);
        if (snap.exists()) {
          const data = snap.data();
          doctorCache[doctorId] = data;
          setDoctor(data);
        }
      } catch (err) {
        console.warn('Doctor fetch failed for card:', doctorId, err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [appointment.doctorId]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
          icon: <CheckCircle2 size={14} className="text-emerald-500" />
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50 border-red-100 text-red-700',
          icon: <XCircle size={14} className="text-red-500" />
        };
      default: // scheduled / pending
        return {
          bg: 'bg-blue-50 border-blue-100 text-blue-700',
          icon: <AlertCircle size={14} className="text-blue-500" />
        };
    }
  };

  const appStatus = appointment.appointmentStatus || appointment.status || 'scheduled';
  const statusStyle = getStatusStyle(appStatus);

  const displayDate = appointment.selectedDate || appointment.date;
  const displaySlot = appointment.selectedSlot || appointment.time;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden h-full">
      {/* Decorative vertical colored stripe based on status */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
        appStatus === 'completed' ? 'bg-emerald-500' :
        appStatus === 'cancelled' ? 'bg-red-500' : 'bg-primary'
      }`} />
      
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2 text-slate-800">
            <div className="p-2 bg-blue-50 text-primary rounded-xl">
              <Stethoscope size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight">Specialist Visit</span>
          </div>
          {/* Status Badge */}
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${statusStyle.bg}`}>
            {statusStyle.icon}
            <span>{appStatus}</span>
          </span>
        </div>

        {/* Doctor Info */}
        {loading ? (
          <div className="animate-pulse space-y-2 py-1">
            <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
        ) : doctor ? (
          <div className="flex items-center space-x-3">
            {doctor.image ? (
              <img 
                src={doctor.image} 
                alt={doctor.name} 
                className="w-10 h-10 rounded-lg object-cover border border-slate-100 shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-primary flex items-center justify-center font-extrabold text-[10px] tracking-wide border border-slate-100 shadow-sm"
              style={{ display: doctor.image ? 'none' : 'flex' }}
            >
              {doctor.name ? doctor.name.replace(/^Dr\.\s+/i, '').split(' ').map(n => n[0]).join('') : 'DR'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-sm truncate">{doctor.name}</h4>
              <p className="text-slate-500 text-xs truncate">{doctor.specialization}</p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            <p className="font-semibold text-slate-400 uppercase tracking-wider">Provider ID</p>
            <p className="font-medium text-slate-700 text-sm mt-0.5">{appointment.doctorId}</p>
          </div>
        )}

        {/* Token and Payment Info */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {appointment.tokenNumber && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <Ticket size={14} className="text-primary" />
              <span className="truncate">{appointment.tokenNumber}</span>
            </div>
          )}
          {appointment.paymentStatus && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <DollarSign size={14} className="text-emerald-500" />
              <span className="truncate uppercase text-[10px]">
                {appointment.paymentStatus === 'paid' ? 'Paid Online' : 'Pay at Clinic'}
              </span>
            </div>
          )}
        </div>

        {/* Date / Time */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
          <div className="flex items-center space-x-2 text-slate-600 text-xs">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium">{displayDate}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 text-xs">
            <Clock size={14} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium">{displaySlot}</span>
          </div>
        </div>
      </div>
      {children && (
        <div className="mt-auto pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;

