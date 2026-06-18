import React from 'react';
import { Eye, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <span className="px-3 py-1 bg-blue-50 text-primary font-semibold text-xs rounded-full uppercase tracking-wider">
          Our Organization
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <HeartPulse className="text-primary" size={32} />
          <span>About Vanitha Clinic</span>
        </h1>
        <p className="text-slate-600 leading-relaxed text-base md:text-lg">
          Vanitha Clinic is a modern clinic management solution designed to simplify appointments, patient records, and doctor schedules. Our mission is to provide seamless, compassionate care through an intuitive digital platform.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid md:grid-cols-2 gap-8 pt-4"
      >
        {/* Vision Card */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)"
          }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-4 transition-all duration-300 relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-primary rounded-xl group-hover:scale-110 transition-transform duration-305">
              <Eye size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Our Vision</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Empowering healthcare clinics with advanced digital solutions to deliver better patient experiences and optimized health outcomes globally.
          </p>
        </motion.div>

        {/* Values Card */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)"
          }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-4 transition-all duration-300 relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-305">
              <ShieldCheck size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Our Values</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Care, Transparency, Professional Integrity, and continuous technological Innovation are the fundamental values guiding our healthcare mission.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
