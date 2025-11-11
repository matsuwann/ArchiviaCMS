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

  if (authLoading || !isAuthenticated) {
    return (
      <main className="container mx-auto p-4 md:p-8 text-center">
        <p className="text-lg">Loading your documents...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Your Submissions
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Here you can view, edit, or delete your uploaded documents.
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <MyUploadsList />
      </div>
    </main>
  );
}