'use client';

import { useAuth } from '../../../context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Admin Dashboard
      </h1>
      <p className="text-lg text-gray-700">
        Welcome, {user?.firstName}! You are logged in as an administrator.
      </p>
      <p className="mt-2 text-gray-600">
        Use the menu on the left to manage users, documents, and system settings.
      </p>

      {/* You can add stats boxes here later */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Total Users</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Total Documents</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Uploads Today</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
      </div>
    </div>
  );
}