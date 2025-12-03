'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, adminUpdateUser, adminDeleteUser } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import EditUserModal from '../../../components/EditUserModal';
import RequestModal from '../../../components/RequestModal'; // Reusing the same modal
import { toast } from 'react-hot-toast';
import Link from 'next/link'; 

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: adminUser } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Archive Modal State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const activeUsers = response.data.filter(u => u.is_active);
      setUsers(activeUsers);
      setError('');
    } catch (err) {
      toast.error('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initiateArchive = (targetUser) => {
    // 1. Prevent archiving self
    if (targetUser.id === adminUser.userId) {
      return toast.error("You cannot archive your own account.");
    }

    // 2. PROTECT SUPER ADMIN: Regular Admins cannot archive Super Admins
    if (targetUser.is_super_admin && !adminUser.is_super_admin) {
        return toast.error("Access Denied: You cannot archive a Super Admin.");
    }

    // 3. Open the Modal
    setUserToArchive(targetUser);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async (reason) => {
    try {
        // Super Admins delete immediately; Regular Admins submit a request
        // NOTE: Even Super Admins might want to leave a reason note if your backend supports it
        if (adminUser.is_super_admin) {
             await adminDeleteUser(userToArchive.id); // Immediate
             toast.success('User archived successfully.');
        } else {
             if (!reason.trim()) return toast.error("Reason is required.");
             await adminDeleteUser(userToArchive.id, { reason }); // Request
             toast.success('Archive request submitted to Super Admin.');
        }
        
        setIsArchiveModalOpen(false);
        setUserToArchive(null);
        fetchUsers(); 
    } catch (err) {
        toast.error('Failed to archive user.'); 
        console.error(err);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleSave = async (userId, updatedData) => {
    if (userId === adminUser.userId && !updatedData.is_admin) {
        return toast.error("You cannot remove your own admin status.");
    }
    
    try {
      await adminUpdateUser(userId, updatedData); 
      toast.success('User updated successfully.');
      setIsEditModalOpen(false);
      fetchUsers(); 
    } catch (err) {
      toast.error('Failed to update user.');
    }
  };

  if (loading) return <p className="text-center">Loading users...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                 <tr><td colSpan="4" className="text-center py-4 text-gray-500">No active users found.</td></tr>
              ) : (
                users.map((user) => {
                  const isPending = user.archive_requested;
                  const isSuperAdminTarget = user.is_super_admin;
                  const isSelf = user.id === adminUser.userId;
                  
                  // Disable if: Self, Pending, or Target is SuperAdmin (and current user isn't one)
                  const isDisabled = isSelf || isPending || (isSuperAdminTarget && !adminUser.is_super_admin);

                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.is_admin ? (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_super_admin ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                            {user.is_super_admin ? 'Super Admin' : 'Admin'}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">User</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(user)} className="py-1 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700">
                          Edit
                        </button>
                        <button
                          onClick={() => initiateArchive(user)}
                          className={`ml-2 py-1 px-3 text-white text-sm font-semibold rounded-lg shadow-md ${isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                          disabled={isDisabled}
                        >
                          {isPending ? 'Pending' : (adminUser.is_super_admin ? 'Archive' : 'Request Archive')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Reusing the same RequestModal for User Archiving */}
      <RequestModal 
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onSubmit={handleConfirmArchive}
        title={adminUser.is_super_admin ? "Confirm Archive" : "Request User Archive"}
        message={
            <p>
                Are you sure you want to archive 
                <span className="font-bold"> {userToArchive?.first_name} {userToArchive?.last_name}</span>?
                {!adminUser.is_super_admin && " A request will be sent to the Super Admin."}
            </p>
        }
        actionLabel={adminUser.is_super_admin ? "Archive User" : "Send Request"}
        confirmColor={adminUser.is_super_admin ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"}
      />
    </>
  );
}