'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 
import { setAuthToken } from '../services/apiService'; 

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        
        if (decodedUser.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
        } else {
          setUser({ 
              firstName: decodedUser.firstName, 
              lastName: decodedUser.lastName, 
              email: decodedUser.email,
              is_admin: decodedUser.is_admin,
              // ADDED: Ensure this field is restored from the token
              is_super_admin: decodedUser.is_super_admin 
          });
          setToken(storedToken);
         
          setAuthToken(storedToken);
        }
      } catch (error) {
        console.error("Invalid token found in storage:", error);
        localStorage.removeItem('token'); 
      }
    }
    setAuthLoading(false);
  }, []);


  const login = (userData, receivedToken) => {
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    // userData comes from the login API response, which already has the field
    setUser(userData); 
    
    setAuthToken(receivedToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
   
    setAuthToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    authLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}