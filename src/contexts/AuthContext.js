// src/contexts/AuthContext.js

import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Create the context
const AuthContext = createContext();

// Export the hook
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
