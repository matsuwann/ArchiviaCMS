'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is done loading and user is not authed or is not an admin
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push('/login'); // Redirect to login
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Show loading state or nothing while checking
  if (authLoading || !isAuthenticated || !user?.is_admin) {
    return (
      <main className="container mx-auto p-8 text-center">
        <p className="text-lg">Loading admin resources...</p>
      </main>
    );
  }

  // If user is an admin, render the admin content
  return (
    <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900">
                Admin Dashboard
            </h1>
        </header>
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
    </main>
  );
}