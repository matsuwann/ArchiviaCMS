'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, adminReactivateUser } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ArchivedUsers() {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchArchivedUsers(); }, []);

  const fetchArchivedUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setArchivedUsers(response.data.filter(u => !u.is_active));
    } catch (err) { toast.error('Failed to fetch archive.'); } 
    finally { setLoading(false); }
  };

  const handleRestore = async (userId) => {
    if (!window.confirm("Restore this user?")) return;
    try { await adminReactivateUser(userId); toast.success('Restored.'); fetchArchivedUsers(); } 
    catch (err) { toast.error('Failed.'); }
  };

  if (loading) return <p className="text-center py-20 text-gray-400">Loading archive...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Archived Users</h2>
            <p className="text-sm text-gray-500">Inactive accounts.</p>
        </div>
        <Link href="/admin/users" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
            &larr; Active Users
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {archivedUsers.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-10 text-gray-400">Archive is empty.</td></tr>
            ) : (
              archivedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs mr-3">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 opacity-50">{user.first_name} {user.last_name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full bg-gray-100 text-gray-500">
                        {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleRestore(user.id)} className="text-green-600 hover:text-green-900 text-xs font-bold px-3 py-1 bg-green-50 rounded-md hover:bg-green-100 transition">
                      Restore Access
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