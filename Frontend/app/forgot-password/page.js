'use client';

import { useState } from 'react';
import { forgotPassword } from '../../services/apiService';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Reset link sent!');
      setEmail('');
    } catch (error) { toast.error('Request failed.'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-4 pt-20 max-w-md">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-sm text-slate-500 mb-6">Enter your email to receive recovery instructions.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button 
            type="submit" disabled={loading}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition shadow-lg disabled:bg-slate-400"
          >
            {loading ? 'Sending...' : 'Send Link'}
          </button>
        </form>
      </div>
    </div>
  );
}