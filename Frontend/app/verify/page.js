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
        if (emailFromQuery) {
            setEmail(emailFromQuery);
        }
    }, [emailFromQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !otp) {
            toast.error("Please provide both email and OTP.");
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(email, otp);
            toast.success("Verification successful! You can now login.");
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error) {
            const msg = error.response?.data?.message || "Verification failed.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 mb-8 bg-slate-100 rounded-lg shadow-md max-w-sm mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
                Enter the 6-digit code sent to your email address.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP Code</label>
                    <input 
                        type="text" 
                        id="otp" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm tracking-widest text-center text-lg"
                        placeholder="123456"
                        maxLength={6}
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>
            </form>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <main className="container mx-auto p-4 md:p-8">
            <Suspense fallback={<p className="text-center">Loading...</p>}>
                <VerifyContent />
            </Suspense>
        </main>
    );
}