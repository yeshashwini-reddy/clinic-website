import React from 'react';
import { Link } from 'react-router-dom';

const heroImg = "/assets/hero.png";

const Hero = () => (
  <section className="relative bg-primary-light bg-opacity-20 py-24 overflow-hidden">
    <div className="container mx-auto flex flex-col md:flex-row items-center px-4">
      <div className="md:w-1/2 text-center md:text-left space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Simple Healthcare for Everyone</h1>
        <p className="text-lg text-gray-700 max-w-md mx-auto md:mx-0">
          Book appointments with trusted doctors in just a few clicks. Manage your health effortlessly.
        </p>
        <Link to="/book-appointment" className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition">
          Book Appointment
        </Link>
      </div>
      <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
        <img src={heroImg} alt="Clinic hero illustration" className="max-w-full h-auto rounded-lg shadow-lg" />
      </div>
    </div>
    {/* Subtle decorative gradient overlay */}
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-primary/10 to-transparent" />
  </section>
);

export default Hero;
