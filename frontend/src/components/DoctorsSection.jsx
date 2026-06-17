import React from "react";
import DoctorCard from "./DoctorCard";
import doctorsData from "../data/doctors";

const DoctorsSection = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
        Meet Our Trusted Doctors
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {doctorsData.map((doc) => (
          <DoctorCard key={doc.id} doctor={doc} />
        ))}
      </div>
    </div>
  </section>
);

export default DoctorsSection;
