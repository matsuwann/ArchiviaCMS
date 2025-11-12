'use client';
// This page is a client component, but it's simple
// You can add more dashboard stats here later.

export default function AdminDashboardPage() {
  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
        Welcome, Admin!
      </h2>
      <p className="text-gray-700">
        You can manage users, documents, and system settings using the links in your profile dropdown menu.
      </p>
    </div>
  );
}