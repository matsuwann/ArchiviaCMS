'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, adminReactivateUser } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ArchivedUsers() {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  const fetchArchivedUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      // FILTER: Only show INACTIVE users
      const inactive = response.data.filter(u => !u.is_active);
      setArchivedUsers(inactive);
      setError('');
    } catch (err) {
      setError('Failed to fetch archived users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (userId) => {
    if (!window.confirm("Are you sure you want to restore this user? They will be able to log in again.")) {
      return;
    }
    try {
      await adminReactivateUser(userId);
      toast.success('User restored successfully.');
      fetchArchivedUsers(); // Refresh list
    } catch (err) {
      toast.error('Failed to restore user.');
      console.error(err);
    }
  };

  if (loading) return <p className="text-center">Loading archive...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Archived Users
        </h2>
        <Link href="/admin/users">
          <button className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-200">
            Back to Users
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {archivedUsers.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-4 text-gray-500">No archived users found.</td></tr>
            ) : (
              archivedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.is_admin ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestore(user.id)}
                      className="py-1 px-3 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}