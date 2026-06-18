import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ArrowLeft, ArrowRight } from 'lucide-react';

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Regular Patient",
    text: "Excellent care! Dr. Venugopal was extremely thorough and helpful. Booking was so simple and the token tracking is live!",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Mother of Two",
    text: "The patient dashboard is so convenient. I can download my prescriptions and see my tokens in real-time. Saves so much time.",
    rating: 5
  },
  {
    name: "Sneha Reddy",
    role: "Local Resident",
    text: "Vanitha Clinic is our family's trusted clinic. Highly recommended for gynaecology and physician consultations!",
    rating: 5
  }
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isPlaying, setIsPlaying] = useState(true);
  const timeoutRef = useRef(null);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeInOut" }
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut" }
    })
  };

  const nextSlide = () => {
    setDirection(1);
    setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!isPlaying) return;
    timeoutRef.current = setInterval(nextSlide, 4500);
    return () => clearInterval(timeoutRef.current);
  }, [isPlaying]);

  return (
    <section 
      className="py-16 bg-white overflow-hidden border-b border-slate-100"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-blue-50 text-primary font-semibold text-xs rounded-full uppercase tracking-wider">
            Patient Feedback
          </span>
          <h2 className="text-3xl font-bold text-slate-800">What Our Patients Say</h2>
        </div>

        <div className="relative min-h-[180px] flex items-center justify-center px-4">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4 max-w-2xl"
            >
              <div className="flex justify-center text-amber-400 space-x-1">
                {[...Array(testimonials[index].rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-slate-600 text-base md:text-lg italic leading-relaxed relative px-6">
                <Quote className="absolute -top-3 -left-2 text-blue-100/50 w-8 h-8 -z-10" />
                "{testimonials[index].text}"
              </p>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{testimonials[index].name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{testimonials[index].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center space-x-3 pt-2">
          <button 
            onClick={prevSlide}
            className="p-2 bg-slate-50 hover:bg-slate-100 hover:scale-105 active:scale-95 text-slate-600 rounded-full border border-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            onClick={nextSlide}
            className="p-2 bg-slate-50 hover:bg-slate-100 hover:scale-105 active:scale-95 text-slate-600 rounded-full border border-slate-200 transition-all cursor-pointer"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
