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
      setTimeout(() => handleRedirect(userData), 1000);
    } catch (error) {
      const errorMessage = error.response?.status === 401
        ? 'Invalid email or password.'
        : 'Login failed. Try again later.';
      toast.error(errorMessage, { id: toastId });
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
      setTimeout(() => handleRedirect(userData), 1000);
    } catch (err) {
      toast.error('Google login failed.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-panel p-8 rounded-2xl shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none pr-10" 
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span></div>
        </div>

        <div className="flex justify-center">
          <div className="w-full overflow-hidden rounded-xl">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Login Failed')}
              theme="filled_blue"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          New to Archivia?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}