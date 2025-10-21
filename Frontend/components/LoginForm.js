'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // ADDED: Import Link component
import { useAuth } from '../context/AuthContext'; // Assuming you have implemented AuthContext

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Assuming you have implemented useAuth

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!username.trim() || !password.trim()) {
      setMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username,
        password,
      });

      // Use context login function to update global state and localStorage
      login(response.data.username, response.data.token);

      setMessage(`Success! Welcome, ${response.data.username}. Redirecting...`);

      setTimeout(() => {
        router.push('/'); 
      }, 1000);
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('Login failed: Invalid username or password.');
      } else {
        setMessage('Login failed. An unexpected error occurred.');
        console.error('Login error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mb-8 bg-slate-100 rounded-lg shadow-md max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">User Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            aria-required="true"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      
      {/* FIXED: The Link component is now defined */}
      <p className="mt-4 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Register now
        </Link>
      </p>
      {/* END FIXED */}

     
    </div>
  );
}