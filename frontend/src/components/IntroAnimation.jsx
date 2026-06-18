import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './IntroAnimation.css';

const IntroAnimation = ({ onComplete }) => {
  useEffect(() => {
    // End intro animation after 5.0 seconds (allowing transition out to finish at 5.7s)
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Stage 2 variants: Logo fades in and scales 0.8 -> 1.1 -> 1
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: [0.8, 1.1, 1],
      transition: { 
        delay: 1.0, 
        duration: 1.0, 
        times: [0, 0.75, 1],
        ease: "easeOut" 
      }
    }
  };

  // Stage 3 variants: Title fades up
  const titleVariants = {
    hidden: { opacity: 0, y: 20, letterSpacing: "0.02em" },
    visible: {
      opacity: 1,
      y: 0,
      letterSpacing: "0.05em",
      transition: { delay: 2.0, duration: 0.8, ease: "easeOut" }
    }
  };

  // Stage 4 tagline group variants
  const wordGroup1 = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: 3.0, duration: 0.6, ease: "easeOut" } 
    }
  };

  const wordGroup2 = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: 3.3, duration: 0.6, ease: "easeOut" } 
    }
  };

  const wordGroup3 = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: 3.6, duration: 0.6, ease: "easeOut" } 
    }
  };

  // Stage 4 variants: Pills (staggered by 100ms starting at 4.0s)
  const pillVariants1 = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: 4.0, duration: 0.4, ease: "easeOut" }
    }
  };

  const pillVariants2 = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: 4.1, duration: 0.4, ease: "easeOut" }
    }
  };

  const pillVariants3 = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: 4.2, duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30, transition: { duration: 0.7, ease: "easeInOut" } }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center intro-container select-none overflow-hidden"
    >
      {/* Background glowing circles (Stage 1) */}
      <div className="intro-glow-circle w-[450px] h-[450px] bg-[#DDEBFF] top-10 left-10" />
      <div className="intro-glow-circle w-[550px] h-[550px] bg-[#6FD3D7] bottom-10 right-10" />

      {/* Floating plus particles (Stage 1) */}
      <div className="intro-plus-particle text-3xl top-[20%] left-[12%]" style={{ animationDelay: '0s' }}>+</div>
      <div className="intro-plus-particle text-xl top-[65%] left-[6%]" style={{ animationDelay: '2s' }}>+</div>
      <div className="intro-plus-particle text-2xl top-[15%] right-[15%]" style={{ animationDelay: '4s' }}>+</div>
      <div className="intro-plus-particle text-xl top-[75%] right-[10%]" style={{ animationDelay: '1s' }}>+</div>
      
      {/* SVG Heartbeat Line Particle (Stage 1) */}
      <svg className="intro-heartbeat-svg" viewBox="0 0 1000 200">
        <path 
          className="intro-heartbeat-path"
          d="M0,100 L400,100 L420,70 L440,130 L460,30 L480,170 L500,100 L520,100 L540,85 L560,115 L580,100 L1000,100" 
          fill="none" 
          stroke="#3F74E7" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
      </svg>

      <div className="flex flex-col items-center max-w-4xl text-center z-10 px-4">
        
        {/* Stage 2: Logo and Dual Rings */}
        <div className="relative flex items-center justify-center">
          
          {/* Inner ring (rotates clockwise slowly) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 0.12,
              scale: [1.1, 1.25, 1.1],
              rotate: 360
            }}
            transition={{ 
              delay: 1.0, 
              duration: 12.0, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute intro-ring-1 border border-[#3F74E7]/40 rounded-full pointer-events-none"
          />
          
          {/* Outer ring (rotates counter-clockwise slowly) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 0.16,
              scale: [1.25, 1.45, 1.25],
              rotate: -360
            }}
            transition={{ 
              delay: 1.2, 
              duration: 15.0, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute intro-ring-2 border border-dashed border-[#6FD3D7]/65 rounded-full pointer-events-none"
          />

          {/* Real Logo Image Container (Enlarged and scaled 0.8 -> 1.1 -> 1) */}
          <motion.div 
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 flex items-center justify-center intro-logo-container bg-white intro-exclude rounded-[2rem] border border-[#DDEBFF] shadow-xl shadow-[#3F74E7]/5 filter drop-shadow-[0_0_20px_rgba(63,116,231,0.08)] overflow-hidden"
          >
            <img src="/assets/logo.png" alt="Vanitha Clinic logo" className="w-[85%] h-[85%] object-contain" />
          </motion.div>
        </div>

        {/* LOGO to TITLE gap spacer: 40px */}
        <div className="h-[40px]" />

        {/* Stage 3: Title */}
        <motion.h1 
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="intro-clinic-title font-extrabold text-[#3150B8] intro-text-glow"
        >
          Vanitha Clinic
        </motion.h1>

        {/* TITLE to TAGLINE gap spacer: 24px */}
        <div className="h-[24px]" />

        {/* Stage 4: Tagline Word Groups */}
        <div className="flex items-center justify-center flex-wrap gap-x-2 md:gap-x-3 text-[#3150B8] font-semibold max-w-3xl intro-clinic-tagline">
          <motion.span variants={wordGroup1} initial="hidden" animate="visible">
            Compassionate Care
          </motion.span>
          <motion.span variants={wordGroup2} initial="hidden" animate="visible" className="text-[#6FD3D7]">
            •
          </motion.span>
          <motion.span variants={wordGroup2} initial="hidden" animate="visible">
            Trusted Doctors
          </motion.span>
          <motion.span variants={wordGroup3} initial="hidden" animate="visible" className="text-[#6FD3D7]">
            •
          </motion.span>
          <motion.span variants={wordGroup3} initial="hidden" animate="visible">
            Better Health
          </motion.span>
        </div>

        {/* TAGLINE to PILLS gap spacer: 30px */}
        <div className="h-[30px]" />

        {/* Stage 4: Staggered Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <motion.div 
            variants={pillVariants1} 
            initial="hidden" 
            animate="visible"
            className="px-5 py-2.5 bg-white intro-exclude border border-[#DDEBFF] rounded-full shadow-sm text-xs md:text-sm font-semibold text-slate-700 flex items-center space-x-2 backdrop-blur-sm"
          >
            <span>🩺</span>
            <span>Expert Doctors</span>
          </motion.div>
          <motion.div 
            variants={pillVariants2} 
            initial="hidden" 
            animate="visible"
            className="px-5 py-2.5 bg-white intro-exclude border border-[#DDEBFF] rounded-full shadow-sm text-xs md:text-sm font-semibold text-slate-700 flex items-center space-x-2 backdrop-blur-sm"
          >
            <span>📅</span>
            <span>Easy Appointments</span>
          </motion.div>
          <motion.div 
            variants={pillVariants3} 
            initial="hidden" 
            animate="visible"
            className="px-5 py-2.5 bg-white intro-exclude border border-[#DDEBFF] rounded-full shadow-sm text-xs md:text-sm font-semibold text-slate-700 flex items-center space-x-2 backdrop-blur-sm"
          >
            <span>💙</span>
            <span>Patient-First Care</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default IntroAnimation;
