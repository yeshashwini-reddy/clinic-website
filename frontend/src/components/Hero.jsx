import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const heroImg = "/assets/hero.png";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="relative bg-primary-light bg-opacity-20 py-24 overflow-hidden">
      <div className="container mx-auto flex flex-col md:flex-row items-center px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:w-1/2 text-center md:text-left space-y-6"
        >
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-primary">
            Simple Healthcare for Everyone
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-gray-700 max-w-md mx-auto md:mx-0">
            Book appointments with trusted doctors in just a few clicks. Manage your health effortlessly.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link 
              to="/book-appointment" 
              className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Book Appointment
            </Link>
          </motion.div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="md:w-1/2 mt-8 md:mt-0 flex justify-center overflow-hidden rounded-lg shadow-lg"
        >
          <motion.img 
            src={heroImg} 
            alt="Clinic hero illustration" 
            className="max-w-full h-auto cursor-pointer" 
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </motion.div>
      </div>
      {/* Subtle decorative gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-primary/10 to-transparent" />
    </section>
  );
};

export default Hero;
