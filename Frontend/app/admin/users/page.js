'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, adminUpdateUser, adminDeleteUser } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import EditUserModal from '../../../components/EditUserModal';
import { toast } from 'react-hot-toast';
import Link from 'next/link'; // Import Link for navigation

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: adminUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      // FILTER: Only show ACTIVE users on this page
      const activeUsers = response.data.filter(u => u.is_active);
      setUsers(activeUsers);
      setError('');
    } catch (err) {
      setError('Failed to fetch users.');
      toast.error('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (userId) => {
    if (userId === adminUser.userId) {
      toast.error("You cannot archive your own account."); 
      return;
    }
    // Updated confirmation text
    if (!window.confirm("Are you sure you want to archive this user? They will be moved to the Archive list.")) {
      return;
    }
    try {
      // This calls the backend delete endpoint (which soft-deletes/deactivates)
      await adminDeleteUser(userId);
      toast.success('User archived.'); 
      fetchUsers(); 
    } catch (err) {
      toast.error('Failed to archive user.'); 
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSave = async (userId, updatedData) => {
    if (userId === adminUser.userId && !updatedData.is_admin) {
        toast.error("You cannot remove your own admin status.");
        return;
    }
    
    try {
      await adminUpdateUser(userId, updatedData); 
      toast.success('User updated successfully.');
      setIsModalOpen(false);
      fetchUsers(); 
    } catch (err) {
      toast.error('Failed to update user.');
      console.error(err);
    }
  };

  if (loading) return <p className="text-center">Loading users...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-3xl font-bold text-gray-900">
            User Management
          </h2>
          {/* Link to the new Archive Page */}
          <Link href="/admin/users/archive">
            <button className="py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200">
              View Archive
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
              {users.length === 0 ? (
                 <tr><td colSpan="4" className="text-center py-4 text-gray-500">No active users found.</td></tr>
              ) : (
                users.map((user) => (
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
                        onClick={() => handleEdit(user)}
                        className="py-1 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(user.id)}
                        className={`ml-2 py-1 px-3 text-white text-sm font-semibold rounded-lg shadow-md bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400`}
                        disabled={user.id === adminUser.userId}
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}