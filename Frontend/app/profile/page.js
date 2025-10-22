'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to the login page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <main className="container mx-auto p-4 md:p-8 text-center">
        <p className="text-xl">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          User Profile
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Welcome to your personal dashboard.
        </p>
      </header>

      <div className="p-6 bg-slate-100 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Account Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-gray-700">Username:</span>
            <span className="text-lg font-semibold text-indigo-600">{user.username}</span>
          </div>
          <div className="text-sm text-gray-500 pt-4">
            *Future versions could include profile editing, document stats, etc.
          </div>
        </div>
      </div>
    </main>
  );
}