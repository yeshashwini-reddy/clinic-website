import React from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import DoctorsSection from "../components/DoctorsSection";
import StatsSection from "../components/StatsSection";
import Testimonials from "../components/Testimonials";

const LandingPage = () => (
  <>
    <Hero />
    <StatsSection />
    <Features />
    <DoctorsSection />
    <Testimonials />
  </>
);

export default LandingPage;
