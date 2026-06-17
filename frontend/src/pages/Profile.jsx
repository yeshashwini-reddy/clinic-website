import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertCircle, User, Mail, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const error = !profile && !loading ? 'Profile details not found in database.' : null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-slate-600 font-medium">Please log in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and review your account details</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center space-y-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600 inline-flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Error Loading Profile</h3>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-indigo-500" />
          
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center font-bold text-2xl uppercase shadow-inner">
              {profile?.name ? profile.name.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{profile?.name || 'N/A'}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mt-1 uppercase tracking-wide">
                {profile?.role || 'Patient'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-slate-700">
              <User className="text-slate-400" size={20} />
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-medium">{profile?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-700">
              <Mail className="text-slate-400" size={20} />
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            {profile?.phone && (
              <div className="flex items-center space-x-3 text-slate-700">
                <ShieldAlert className="text-slate-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-medium">{profile.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
