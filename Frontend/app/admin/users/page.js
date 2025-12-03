'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, adminUpdateUser, adminDeleteUser } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import EditUserModal from '../../../components/EditUserModal';
import RequestModal from '../../../components/RequestModal';
import { toast } from 'react-hot-toast';
import Link from 'next/link'; 

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: adminUser } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data.filter(u => u.is_active));
    } catch (err) { toast.error('Failed to fetch users.'); } 
    finally { setLoading(false); }
  };

  const initiateArchive = (targetUser) => {
    if (targetUser.id === adminUser.userId) return toast.error("You cannot archive yourself.");
    if (targetUser.is_super_admin && !adminUser.is_super_admin) return toast.error("Access Denied.");
    setUserToArchive(targetUser);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async (reason) => {
    try {
        if (adminUser.is_super_admin) {
             await adminDeleteUser(userToArchive.id);
             toast.success('User archived.');
        } else {
             if (!reason.trim()) return toast.error("Reason required.");
             await adminDeleteUser(userToArchive.id, { reason });
             toast.success('Request sent.');
        }
        setIsArchiveModalOpen(false);
        setUserToArchive(null);
        fetchUsers(); 
    } catch (err) { toast.error('Failed.'); }
  };

  const handleEdit = (user) => { setSelectedUser(user); setIsEditModalOpen(true); };

  const handleSave = async (userId, updatedData) => {
    if (userId === adminUser.userId && !updatedData.is_admin) return toast.error("Cannot remove own admin status.");
    try {
      await adminUpdateUser(userId, updatedData); 
      toast.success('Updated!');
      setIsEditModalOpen(false);
      fetchUsers(); 
    } catch (err) { toast.error('Failed.'); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">User Directory</h2>
            <p className="text-sm text-gray-500">Manage system access and roles.</p>
        </div>
        <Link href="/admin/users/archive" className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
            View Archived Users
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
              {users.map((user) => {
                  const isPending = user.archive_requested;
                  const isSuperAdminTarget = user.is_super_admin;
                  const isDisabled = (user.id === adminUser.userId) || isPending || (isSuperAdminTarget && !adminUser.is_super_admin);

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                          <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-gray-900">{user.first_name} {user.last_name}</div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_admin ? (
                          <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full ${user.is_super_admin ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                            {user.is_super_admin ? 'Super Admin' : 'Admin'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full bg-green-100 text-green-700">Standard User</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 text-xs font-bold px-3 py-1 bg-indigo-50 rounded-md hover:bg-indigo-100 transition">
                          Edit
                        </button>
                        <button
                          onClick={() => initiateArchive(user)}
                          disabled={isDisabled}
                          className={`text-xs font-bold px-3 py-1 rounded-md transition ${isDisabled ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
                        >
                          {isPending ? 'Request Pending' : (adminUser.is_super_admin ? 'Archive' : 'Request Archive')}
                        </button>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
        </table>
      </div>

      {isEditModalOpen && <EditUserModal user={selectedUser} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} />}
      
      <RequestModal 
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onSubmit={handleConfirmArchive}
        title={adminUser.is_super_admin ? "Archive User" : "Request Archive"}
        message={<p>Archive <strong>{userToArchive?.first_name} {userToArchive?.last_name}</strong>?</p>}
        actionLabel={adminUser.is_super_admin ? "Archive" : "Send Request"}
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}