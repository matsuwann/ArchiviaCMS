'use client';

import { useState } from 'react';
import { forgotPassword } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Check your email for the reset link!');
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/40 max-w-md w-full">
        <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            {/* FIXED APOSTROPHE HERE */}
            <p className="text-sm text-gray-500 mt-2">
            Enter your email and we&apos;ll send you a recovery link.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
            <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1"
                required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                &larr; Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}