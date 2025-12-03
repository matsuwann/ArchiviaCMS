'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '../../services/apiService';
import PasswordChecklist from '../../components/PasswordChecklist';
import { toast } from 'react-hot-toast';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [passwordValidity, setPasswordValidity] = useState({
    hasLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false,
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
    if (password !== confirmPassword) return toast.error("Passwords don't match.");
    if (!Object.values(passwordValidity).every(Boolean)) return toast.error("Password too weak.");

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Success! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">Invalid or expired reset link.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">New Password</label>
        <input 
            type="password" 
            value={password} 
            onChange={handlePasswordChange} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1" 
            required 
        />
        <PasswordChecklist validity={passwordValidity} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Confirm Password</label>
        <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1" 
            required 
        />
      </div>
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-all active:scale-[0.98]"
      >
        {loading ? 'Resetting...' : 'Set New Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/40 max-w-md w-full animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Secure Account Recovery</h1>
        <Suspense fallback={<div className="text-center py-10 text-gray-500">Loading secure form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}