import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, User, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="container mx-auto py-6 space-y-12">
      
      {/* Banner / Hero Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-blue-600" />
        <div className="space-y-4 md:max-w-xl text-center md:text-left">
          <span className="px-3 py-1 bg-blue-50 text-primary font-semibold text-xs rounded-full uppercase tracking-wider">
            Vanitha Clinic Platform
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Welcome to <span className="text-primary">Vanitha Clinic</span>
          </h1>
          <p className="text-slate-600 md:text-lg leading-relaxed">
            Manage your appointments, explore medical specialists, and review scheduled consultations in one convenient patient dashboard.
          </p>
          <div className="pt-2">
            <Link 
              to="/doctors" 
              className="inline-flex items-center space-x-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-dark shadow-md hover:shadow-lg transition-all"
            >
              <span>Explore Specialists</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/2 max-w-sm md:max-w-md">
          <img 
            src="/assets/hero.png" 
            alt="Vanitha Clinic Hero Illustration" 
            className="w-full h-auto rounded-2xl shadow-sm hover:scale-[1.02] transition-transform duration-300" 
          />
        </div>
      </div>

      {/* Main Navigation Actions Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quick Portal Services</h2>
          <p className="text-sm text-slate-500 mt-1">Select one of our online client workflows below</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Card 1: View Doctors */}
          <Link 
            to="/doctors" 
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Stethoscope size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">
                  View Doctors
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Browse list of available clinicians, medical specialties, and outpatient timings.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform duration-300 space-x-1">
              <span>Explore Directory</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 2: Book Appointment */}
          <Link 
            to="/book-appointment" 
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                  Book Appointment
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select your medical provider, choose date & time, and instantly secure your booking.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-emerald-500 group-hover:translate-x-1 transition-transform duration-300 space-x-1">
              <span>Book Appointment</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 3: My Appointments */}
          <Link 
            to="/my-appointments" 
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  My Appointments
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track schedule, verify statuses, and manage your booked clinical reservations.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-indigo-500 group-hover:translate-x-1 transition-transform duration-300 space-x-1">
              <span>View Schedule</span>
              <ArrowRight size={14} />
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
};

export default Home;
