import React, { useState, useEffect, useRef } from 'react';
import { useInView, motion } from 'framer-motion';
import { Award, Users, CheckCircle2, Heart } from 'lucide-react';

const CountUp = ({ to, duration = 1.5, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(to, 10);
    if (isNaN(end)) return;

    const totalMs = duration * 1000;
    const intervalTime = 16; // ~60 FPS
    const steps = Math.ceil(totalMs / intervalTime);
    const stepVal = end / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(stepVal * currentStep));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isInView, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const StatsSection = () => {
  const stats = [
    { 
      icon: <Award className="w-6 h-6 text-primary" />, 
      title: "Years of Service", 
      value: 15, 
      suffix: "+" 
    },
    { 
      icon: <Users className="w-6 h-6 text-emerald-500" />, 
      title: "Happy Patients", 
      value: 12000, 
      suffix: "+" 
    },
    { 
      icon: <CheckCircle2 className="w-6 h-6 text-indigo-500" />, 
      title: "Satisfaction Rate", 
      value: 99, 
      suffix: "%" 
    },
    { 
      icon: <Heart className="w-6 h-6 text-purple-500" />, 
      title: "Medical Experts", 
      value: 20, 
      suffix: "+" 
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center space-x-4 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
