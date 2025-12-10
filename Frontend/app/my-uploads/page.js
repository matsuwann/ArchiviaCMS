'use client';

import { useAuth } from '../../context/AuthContext'; 
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MyUploadsList from '../../components/MyUploadsList'; 

export default function MyUploadsPage() {
  const { isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return <main className="container mx-auto p-10 text-center text-slate-400">Loading...</main>;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Your Contributions</h1>
        <p className="mt-1 text-slate-500">Manage the documents you have contributed to the repository.</p>
      </header>

      <div className="max-w-5xl mx-auto">
        <MyUploadsList />
      </div>
    </main>
  );
}