'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import PasswordChecklist from './PasswordChecklist.js'; 

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

 
  const [showPassword, setShowPassword] = useState(false);
  

  const [passwordValidity, setPasswordValidity] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    setPasswordValidity({
      hasLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[@$!%*?&]/.test(newPassword),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setMessage('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const allValid = Object.values(passwordValidity).every(Boolean);
    if (!allValid) {
        setMessage('Please ensure your password meets all the requirements.');
        return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        firstName,
        lastName,
        email,
        password,
      });

      setMessage(`Success! ${response.data.message}`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Registration failed: ${error.response.data.message}`);
      } else {
        setMessage('Registration failed. An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mb-8 bg-slate-100 rounded-lg shadow-md max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Register New Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex gap-4">
            <div className="w-1/2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div className="w-1/2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
        </div>
        
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
        </div>
        
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {password && <PasswordChecklist validity={passwordValidity} />}
        </div>
        
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {confirmPassword && (
            <p className={`mt-1 text-sm ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
              {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}