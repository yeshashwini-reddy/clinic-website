import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { setDocWithTimeout } from '../utils/firestoreHelper';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase user object
  const isAuthenticated = !!user;

  // Pre-seed profile from localStorage so the UI renders instantly (no spinner)
  // Firebase will update this in background once it responds
  const [profile, setProfile] = useState(() => {
    try {
      // We don't know the uid yet, so scan for any stored profile key
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vanitha_clinic_user_profile_')) {
          const val = localStorage.getItem(key);
          if (val) return JSON.parse(val);
        }
      }
    } catch (_) {}
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes with safety timeouts to prevent page hangs
  useEffect(() => {
    // Force loading to false if Firebase initialization hangs for more than 800ms
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      console.warn('Vanitha Clinic initialization safety timeout triggered. Rendering application.');
    }, 800);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          setUser(currentUser);
          if (currentUser) {
            const profileRef = doc(db, 'users', currentUser.uid);
            
            // Race profile fetch against a 900ms timeout to prevent hanging offline
            const profilePromise = getDoc(profileRef);
            profilePromise.catch(() => {}); // Prevent unhandled promise rejection if timeout wins
            const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 900));
            
            const result = await Promise.race([profilePromise, timeoutPromise]);
            
            if (result === 'timeout') {
              console.warn('Firestore user profile fetch timed out. Checking local cache.');
              let cachedProfile = null;
              try {
                const cached = localStorage.getItem(`vanitha_clinic_user_profile_${currentUser.uid}`);
                if (cached) {
                  cachedProfile = JSON.parse(cached);
                }
              } catch (e) {
                console.error('Failed to parse cached profile:', e);
              }

              if (cachedProfile) {
                setProfile(cachedProfile);
              } else {
                setProfile({
                  name: currentUser.displayName || '',
                  email: currentUser.email,
                  phone: '',
                  role: 'patient',
                  createdAt: new Date().toISOString(),
                });
              }
            } else if (result && result.exists()) {
              const profileData = result.data();
              try {
                localStorage.setItem(`vanitha_clinic_user_profile_${currentUser.uid}`, JSON.stringify(profileData));
              } catch (e) {
                console.error('Failed to cache user profile:', e);
              }
              setProfile(profileData);
            } else {
              // Minimal profile if not found
              const newProfile = {
                name: currentUser.displayName || '',
                email: currentUser.email,
                phone: '',
                role: 'patient',
                createdAt: new Date().toISOString(),
              };
              try {
                localStorage.setItem(`vanitha_clinic_user_profile_${currentUser.uid}`, JSON.stringify(newProfile));
              } catch (e) {
                console.error('Failed to cache new user profile:', e);
              }
              try {
                await setDocWithTimeout(profileRef, newProfile, {}, 1200);
              } catch (e) {
                console.error('Failed to create user profile document:', e);
              }
              setProfile(newProfile);
            }
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Error in auth observer:', error);
        } finally {
          clearTimeout(safetyTimeout);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Firebase Auth Observer error:', error);
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);


  // Register
  const register = async (email, password, name, phone) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const newProfile = {
      name,
      email,
      phone,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`vanitha_clinic_user_profile_${cred.user.uid}`, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Failed to cache registered profile:', e);
    }
    // Store profile in Firestore with safety timeout to prevent button hanging
    await setDocWithTimeout(doc(db, 'users', cred.user.uid), newProfile, {}, 1200);
  };

  // Login
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    if (user) {
      localStorage.removeItem(`vanitha_clinic_user_profile_${user.uid}`);
    }
    await signOut(auth);
  };

  const isAdmin = user && profile && profile.role === 'admin';
  const isPatient = user && profile && profile.role === 'patient';
  const isDoctor = user && profile && profile.role === 'doctor';

  const value = {
    user,
    profile,
    loading,
    register,
    login,
    logout,
    isAdmin,
    isPatient,
    isDoctor,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only block render if loading AND there's no pre-seeded profile data yet */}
      {loading && !profile ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Initializing Vanitha Clinic...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
