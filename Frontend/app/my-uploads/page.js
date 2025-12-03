'use client';

import { useAuth } from '../../context/AuthContext'; 
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MyUploadsList from '../../components/MyUploadsList'; 

export default function MyUploadsPage() {
  const { isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center md:text-left py-6 border-b border-white/20">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
            Your Submissions
            </h1>
            <p className="text-indigo-100 mt-1">
            Manage and track the status of your uploaded documents.
            </p>
        </header>

        <MyUploadsList />
      </div>
    </main>
  );
}