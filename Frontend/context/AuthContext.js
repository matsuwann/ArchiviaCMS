'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const AuthContext = createContext(null);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const router = useRouter();

  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('auth_token');
    

    if (storedUsername && token) {
      setUser({ username: storedUsername });
    }
    setLoading(false);
  }, []);


  const login = (username, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('username', username);
    setUser({ username });
  };


  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    setUser(null);
    router.push('/login'); 
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    authLoading: loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}