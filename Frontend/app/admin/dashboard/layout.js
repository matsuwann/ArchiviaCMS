'use client';

import { useAuth } from '../../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

// You can find icons from a library like react-icons
// For now, we'll use simple text placeholders.
const AdminSidebarLink = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={`block px-4 py-3 rounded-md text-sm font-medium ${
        isActive 
          ? 'bg-blue-800 text-white' 
          : 'text-blue-100 hover:bg-blue-600 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};

export default function AdminDashboardLayout({ children }) {
  const { isAdmin, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading || !isAdmin) {
    return (
      <main className="container mx-auto p-4 md:p-8 text-center">
        <p className="text-lg">Loading admin dashboard...</p>
      </main>
    );
  }

  // If user is an admin, show the dashboard
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-4 space-y-2 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 border-b border-blue-500 pb-2">Admin Menu</h2>
        <nav className="flex-grow">
          <AdminSidebarLink href="/admin/dashboard">
            Dashboard Home
          </AdminSidebarLink>
          <AdminSidebarLink href="/admin/dashboard/users">
            User Management
          </AdminSidebarLink>
          <AdminSidebarLink href="/admin/dashboard/documents">
            Document Management
          </AdminSidebarLink>
          <AdminSidebarLink href="/admin/dashboard/history">
            Upload History
          </AdminSidebarLink>
          <AdminSidebarLink href="/admin/dashboard/settings">
            Design Settings
          </AdminSidebarLink>
        </nav>
        <div className="mt-auto">
           <AdminSidebarLink href="/">
            &larr; Back to Main Site
           </AdminSidebarLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}