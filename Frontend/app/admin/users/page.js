'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, adminUpdateUserRole, adminDeleteUser } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: adminUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === adminUser.userId) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user? This is permanent.")) {
      return;
    }
    try {
      await adminDeleteUser(userId);
      alert('User deleted.');
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert('Failed to delete user.');
      console.error(err);
    }
  };

  const handleToggleAdmin = async (userId, newAdminStatus) => {
  if (userId === adminUser.userId) {
    alert("You cannot change your own admin status from this panel.");
    return;
  }
  const action = newAdminStatus ? "promote to admin" : "remove as admin";
  if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
  }
try {
    await adminUpdateUserRole(userId, newAdminStatus); // This API service name is fine
    alert('User status updated.');
    fetchUsers(); // Refresh the list
  } catch (err) {
    alert('Failed to update status.');
    console.error(err);
  }
};

  if (loading) return <p className="text-center">Loading users...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
        User Management
      </h2>
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.is_admin ? (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Admin
            </span>
          ) : (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
              User
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {/* This button replaces the "Delete" button's column, or you can add it next to delete */}
          <button
            onClick={() => handleToggleAdmin(user.id, !user.is_admin)}
            className={`py-1 px-3 text-sm font-semibold rounded-lg shadow-md ${
              user.is_admin 
                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:bg-gray-400`}
            disabled={user.id === adminUser.userId}
          >
            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
          </button>
          <button
            onClick={() => handleDelete(user.id)}
            className="ml-2 py-1 px-3 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400"
            disabled={user.id === adminUser.userId}
          >
            Delete
          </button>
        </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="py-1 px-3 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400"
                    disabled={user.id === adminUser.userId}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}