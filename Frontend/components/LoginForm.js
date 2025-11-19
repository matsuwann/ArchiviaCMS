'use client';
import { GoogleLogin } from '@react-oauth/google'; 
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/apiService';
import { toast } from 'react-hot-toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.'); 
      return;
    }

    setLoading(true);

    const toastId = toast.loading('Logging in...');

    try {
      const response = await apiLogin(email, password);

      login(response.data.user, response.data.token);
      
      toast.success(`Success! Welcome, ${response.data.user.firstName}.`, { id: toastId });

      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (error) {
      const errorMessage = error.response?.status === 401
        ? 'Login failed: Invalid email or password.'
        : 'Login failed. An unexpected error occurred.';
      
      toast.error(errorMessage, { id: toastId });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      
      login(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.firstName}!`);
      
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (err) {
      console.error('Google Login Error:', err);
      toast.error('Google login failed.');
    }
  };

  return (
    <div className="p-6 mb-8 bg-slate-100 rounded-lg shadow-md max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">User Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
            aria-required="true"
          />
        </div>
        <div className="flex justify-end">
  <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
    Forgot password?
  </Link>
</div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>

      <div className="my-4 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google Login Failed')}
          theme="outline"
          size="large"
          width="100%"
        />
      </div>
      
      
      <p className="mt-4 text-center text-sm text-gray-500">
        {/* FIX: Replaced ' with &apos; */}
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Register now
        </Link>
      </p>
    </div>
  );
}