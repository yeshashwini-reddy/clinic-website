import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-white">
      <h1 className="text-4xl font-bold mb-4">Vanitha Clinic</h1>
      <p className="text-lg">Your simple local clinic management solution</p>
    </div>
  );
};

export default SplashScreen;
