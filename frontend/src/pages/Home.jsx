import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const cardGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const MotionLink = motion(Link);

  return (
    <div className="container mx-auto py-6 space-y-12">
      
      {/* Banner / Hero Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-blue-600" />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 md:max-w-xl text-center md:text-left"
        >
          <motion.span variants={itemVariants} className="inline-block px-3 py-1 bg-blue-50 text-primary font-semibold text-xs rounded-full uppercase tracking-wider">
            Vanitha Clinic Platform
          </motion.span>
          <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Welcome to <span className="text-primary">Vanitha Clinic</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-600 md:text-lg leading-relaxed">
            Manage your appointments, explore medical specialists, and review scheduled consultations in one convenient patient dashboard.
          </motion.p>
          <motion.div variants={itemVariants} className="pt-2">
            <Link 
              to="/doctors" 
              className="inline-flex items-center space-x-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>Explore Specialists</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="w-full md:w-1/2 max-w-sm md:max-w-md overflow-hidden rounded-2xl"
        >
          <motion.img 
            src="/assets/hero.png" 
            alt="Vanitha Clinic Hero Illustration" 
            className="w-full h-auto shadow-sm cursor-pointer" 
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </motion.div>
      </div>

      {/* Main Navigation Actions Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quick Portal Services</h2>
          <p className="text-sm text-slate-500 mt-1">Select one of our online client workflows below</p>
        </div>
        
        <motion.div 
          variants={cardGridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          
          {/* Card 1: View Doctors */}
          <MotionLink 
            to="/doctors" 
            variants={cardVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)", borderColor: "rgba(59, 130, 246, 0.2)" }}
            transition={{ duration: 0.3 }}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between"
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
          </MotionLink>

          {/* Card 2: Book Appointment */}
          <MotionLink 
            to="/book-appointment" 
            variants={cardVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)", borderColor: "rgba(16, 185, 129, 0.2)" }}
            transition={{ duration: 0.3 }}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between"
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
          </MotionLink>

          {/* Card 3: My Appointments */}
          <MotionLink 
            to="/my-appointments" 
            variants={cardVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)", borderColor: "rgba(99, 102, 241, 0.2)" }}
            transition={{ duration: 0.3 }}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between"
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
          </MotionLink>

        </motion.div>
      </div>

    </div>
  );
};

export default Home;
