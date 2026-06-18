import React, { useState, useEffect, useRef } from 'react';
import { useInView, motion } from 'framer-motion';

const CountUpText = ({ value, duration = 1.2 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) {
      setDisplayValue(value);
      return;
    }

    const valueStr = String(value);
    const match = valueStr.match(/([\d.]+)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const numStr = match[1];
    const endVal = parseFloat(numStr);
    if (isNaN(endVal)) {
      setDisplayValue(value);
      return;
    }

    // Determine decimal places
    const decimalPlaces = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    const prefix = valueStr.substring(0, match.index);
    const suffix = valueStr.substring(match.index + numStr.length);

    const totalMs = duration * 1000;
    const intervalTime = 16; // ~60fps
    const steps = Math.ceil(totalMs / intervalTime);
    const stepVal = endVal / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(prefix + endVal.toFixed(decimalPlaces) + suffix);
        clearInterval(timer);
      } else {
        const currentNum = stepVal * currentStep;
        setDisplayValue(prefix + currentNum.toFixed(decimalPlaces) + suffix);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue}</span>;
};

const StatCard = ({ title, value, icon, bgColor = "bg-blue-50" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    whileHover={{ y: -4, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.05)" }}
    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center space-x-4 transition-all duration-300 h-full cursor-pointer"
  >
    <div className={`p-4 ${bgColor} rounded-2xl flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate" title={title}>{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-800 mt-1 truncate">
        <CountUpText value={value} />
      </h3>
    </div>
  </motion.div>
);

export default StatCard;
