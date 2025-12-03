'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from '../../services/apiService';
import { toast } from 'react-hot-toast';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const emailFromQuery = searchParams.get('email');

    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (emailFromQuery) setEmail(emailFromQuery);
    }, [emailFromQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !otp) return toast.error("Please provide both email and OTP.");

        setLoading(true);
        try {
            await verifyEmail(email, otp);
            toast.success("Verification successful!");
            setTimeout(() => router.push('/login'), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/40 max-w-sm w-full mx-auto animate-fade-in">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Check your Inbox</h2>
                <p className="text-sm text-gray-500 mt-2">
                    We've sent a 6-digit code to your email.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1"
                        required 
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">OTP Code</label>
                    <input 
                        type="text" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1 text-center font-mono text-xl tracking-[0.5em]"
                        placeholder="000000"
                        maxLength={6}
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
            </form>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <VerifyContent />
            </Suspense>
        </main>
    );
}