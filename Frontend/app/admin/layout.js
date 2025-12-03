'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push('/login'); 
    }
  }, [isAuthenticated, user, authLoading, router]);

  if (authLoading || !isAuthenticated || !user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
        {/* We remove the global 'Admin Dashboard' header here because 
            each sub-page (Dashboard, Users, Settings) now has its own 
            dedicated, styled header. This creates a cleaner look. */}
        <main className="container mx-auto p-4 md:p-6 max-w-7xl">
            {children}
        </main>
    </div>
  );
}