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
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  
  const handleRedirect = (user) => {
    if (user.is_admin) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.'); 
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Logging in...');
    try {
      const response = await apiLogin({ email, password });
      const userData = response.data.user;
      login(userData, response.data.token);
      toast.success(`Success! Welcome, ${userData.firstName}.`, { id: toastId });
      setTimeout(() => {
        handleRedirect(userData);
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
      const userData = res.data.user;
      login(userData, res.data.token);
      toast.success(`Welcome, ${userData.firstName}!`);
      setTimeout(() => {
        handleRedirect(userData);
      }, 1000);
    } catch (err) {
      console.error('Google Login Error:', err);
      toast.error('Google login failed.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
        <p className="text-slate-500 text-sm mt-2">Sign in to access the repository</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-12" 
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            Forgot password?
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="mx-4 text-slate-400 text-xs font-bold uppercase tracking-wide">Or continue with</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google Login Failed')}
          theme="outline"
          size="large"
          width="100%"
          shape="pill"
        />
      </div>
      
      <p className="mt-8 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
          Create one now
        </Link>
      </p>
    </div>
  );
}