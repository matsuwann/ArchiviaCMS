'use client';

import { useState } from 'react';
import { forgotPassword } from '../../services/apiService';
import { toast } from 'react-hot-toast';

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
    <div className="container mx-auto p-4 pt-20 max-w-sm">
      <div className="bg-slate-100 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}