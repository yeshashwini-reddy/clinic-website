import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    // Format the message for WhatsApp using your clinic's primary phone number
    const waNumber = "918978461909"; 
    const waText = encodeURIComponent(
      `*New Website Inquiry*\n\n` +
      `*Name:* ${name}\n` +
      `*Email:* ${email}\n\n` +
      `*Message:*\n${message}`
    );
    
    // Open WhatsApp in a new tab
    window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');

    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-12">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <span className="px-3 py-1 bg-blue-50 text-primary font-semibold text-xs rounded-full uppercase tracking-wider">
          Get In Touch
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
          Contact Vanitha Clinic
        </h1>
        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
          Have any questions or need assistance? Reach out to our customer care team or visit us at our main Hyderabad clinic.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Contact Information Details */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="md:col-span-5 space-y-6"
        >
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-blue-600" />
            
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Clinic Details</h3>

            <div className="space-y-6">
              {/* Address card */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinic Address</h4>
                  <p className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed">
                    Balanagar, Hyderabad,<br />
                    Telangana - 500042, India
                  </p>
                </div>
              </div>

              {/* Phone card */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Numbers</h4>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800 hover:text-primary transition-colors">
                      <a href="tel:8978461909">+91 89784 61909</a>
                    </p>
                    <p className="text-sm font-semibold text-slate-800 hover:text-primary transition-colors">
                      <a href="tel:9247763538">+91 92477 63538</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Email card */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</h4>
                  <p className="text-sm font-semibold text-slate-800 mt-1 hover:text-primary transition-colors">
                    <a href="mailto:yeshashwinireddy32@gmail.com">yeshashwinireddy32@gmail.com</a>
                  </p>
                </div>
              </div>

              {/* Hours card */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Hours</h4>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    Mon - Sat: 9:00 AM - 5:00 PM<br />
                    <span className="text-xs font-medium text-slate-500">Closed on Sundays</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-md p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />

          <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Send us a Message</h3>

          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-scaleUp">
              <div className="inline-flex p-3 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100 shadow-inner scale-110 mb-2 animate-bounce">
                <CheckCircle2 size={40} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-800">Message Sent Successfully!</h4>
                <p className="text-xs text-slate-500">Thank you for writing. Our clinic administrators will reply shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="E.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm input-focus-glow transition-all duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="contact-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="janedoe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm input-focus-glow transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-message" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Message Description</label>
                <textarea
                  id="contact-message"
                  required
                  rows="5"
                  placeholder="How can we help you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm resize-none input-focus-glow transition-all duration-200"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  type="submit"
                  title="Send via WhatsApp"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 bg-[#25D366] text-white rounded-full hover:bg-[#1ebd5a] transition-all shadow-lg shadow-[#25D366]/30 flex items-center justify-center group relative cursor-pointer"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-7 h-7 fill-current"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  
                  {/* Tooltip on hover */}
                  <span className="absolute -top-10 scale-0 transition-all rounded-lg bg-slate-800 p-2 text-xs text-white group-hover:scale-100 whitespace-nowrap shadow-lg">
                    Send via WhatsApp
                  </span>
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
